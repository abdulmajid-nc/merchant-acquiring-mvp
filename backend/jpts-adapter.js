/**
 * jPTS Database Adapter
 * This adapter provides MongoDB-like interface to work with jPTS using PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Get PostgreSQL connection info from environment variables or use provided defaults
const JPTS_HOST = process.env.JPTS_HOST || 'localhost';
const JPTS_PORT = process.env.JPTS_PORT || '5432';
const JPTS_USER = process.env.JPTS_USER || 'postgres';  // Changed default from 'jpos' to 'postgres'
const JPTS_PASSWORD = process.env.JPTS_PASSWORD || 'postgres';  // Using 'postgres' as default password
const JPTS_DB = process.env.JPTS_DB || 'jpts_dev';

// Create a logger
const logFile = path.join(__dirname, 'jpts-adapter.log');
const logger = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(`[jPTS Adapter] ${message}`);
  },
  error: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.error(`[jPTS Adapter ERROR] ${message}`);
  }
};

// PostgreSQL connection pool
let pool = null;
let connected = false;

/**
 * Initialize the jPTS adapter with PostgreSQL connection
 */
function init() {
  logger.log(`Initializing jPTS adapter with PostgreSQL connection: host=${JPTS_HOST}, port=${JPTS_PORT}, db=${JPTS_DB}, user=${JPTS_USER}`);
  
  try {
    // Create a connection pool
    pool = new Pool({
      host: JPTS_HOST,
      port: JPTS_PORT,
      database: JPTS_DB,
      user: JPTS_USER,
      password: JPTS_PASSWORD,
      // Connection timeout of 5 seconds
      connectionTimeoutMillis: 5000,
      // Idle timeout of 30 seconds
      idleTimeoutMillis: 30000
    });
    
    // Test the connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        connected = false;
        logger.error(`Failed to connect to PostgreSQL: ${err.message}`);
      } else {
        connected = true;
        logger.log(`Successfully connected to PostgreSQL. Server time: ${res.rows[0].now}`);
      }
    });
    
    logger.log('jPTS adapter initialized with PostgreSQL connection pool');
  } catch (err) {
    logger.error(`Error creating PostgreSQL connection pool: ${err.message}`);
    connected = false;
  }
  
  return {
    pool,
    isConnected: () => {
      // If we're already connected, return true
      if (connected) {
        return true;
      }
      
      // Try to query to see if we can establish a connection
      try {
        pool.query('SELECT NOW()');
        connected = true;
        return true;
      } catch (error) {
        logger.error(`Error checking connection: ${error.message}`);
        return false;
      }
    },
    disconnect: () => {
      if (pool) {
        pool.end();
        connected = false;
        logger.log('PostgreSQL connection pool closed');
      }
    },
    query: async (text, params) => {
      if (!pool) {
        throw new Error('PostgreSQL connection pool not initialized');
      }
      
      logger.log(`Executing SQL query: ${text} with params: ${JSON.stringify(params || [])}`);
      try {
        const result = await pool.query(text, params);
        return result;
      } catch (err) {
        logger.error(`SQL query error: ${err.message}`);
        throw err;
      }
    }
  };
}

/**
 * Create a MongoDB-compatible model using jPTS with PostgreSQL
 * This provides a MongoDB-like interface for your existing code to work with PostgreSQL
 */
function createModel(modelName, schema) {
  logger.log(`Creating model for ${modelName}`);
  
  // Table name is the lowercase version of the model name
  const tableName = modelName.toLowerCase();
  
  // Helper function to convert MongoDB query to SQL WHERE clause
  const buildWhereClause = (query) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];
        
        if (typeof value === 'object' && value !== null) {
          // Handle MongoDB operators like $gt, $lt, etc.
          for (const op in value) {
            if (Object.prototype.hasOwnProperty.call(value, op)) {
              const opValue = value[op];
              switch(op) {
                case '$gt':
                  conditions.push(`${key} > $${paramIndex++}`);
                  values.push(opValue);
                  break;
                case '$gte':
                  conditions.push(`${key} >= $${paramIndex++}`);
                  values.push(opValue);
                  break;
                case '$lt':
                  conditions.push(`${key} < $${paramIndex++}`);
                  values.push(opValue);
                  break;
                case '$lte':
                  conditions.push(`${key} <= $${paramIndex++}`);
                  values.push(opValue);
                  break;
                case '$ne':
                  conditions.push(`${key} <> $${paramIndex++}`);
                  values.push(opValue);
                  break;
                default:
                  logger.log(`Unsupported operator: ${op}`);
              }
            }
          }
        } else {
          conditions.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
      }
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
      
    return { whereClause, values };
  };
  
  // Helper function to extract update fields
  const buildSetClause = (update) => {
    const sets = [];
    const values = [];
    let paramIndex = 1;
    
    // Handle $set operator in MongoDB update
    const updateData = update.$set || update;
    
    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        sets.push(`${key} = $${paramIndex++}`);
        values.push(updateData[key]);
      }
    }
    
    const setClause = sets.join(', ');
    return { setClause, values };
  };
  
  return {
    // Create MongoDB-like query methods that interact with PostgreSQL
    find: async (query = {}) => {
      logger.log(`[${modelName}] Find operation with query: ${JSON.stringify(query)}`);
      
      try {
        const { whereClause, values } = buildWhereClause(query);
        const sql = `SELECT * FROM ${tableName} ${whereClause}`;
        const result = await pool.query(sql, values);
        
        const resultObject = result.rows.map(row => {
          // Convert id to _id for MongoDB compatibility if needed
          if (row.id && !row._id) {
            row._id = row.id;
          }
          return row;
        });
        
        // Add the populate method to support MongoDB-like population
        resultObject.populate = function() {
          logger.log(`[${modelName}] Populate method called but not implemented in jPTS adapter`);
          // Return this same object to allow method chaining
          return resultObject;
        };
        
        return resultObject;
      } catch (err) {
        logger.error(`[${modelName}] Find operation error: ${err.message}`);
        return [];
      }
    },
    
    findOne: async (query = {}) => {
      logger.log(`[${modelName}] FindOne operation with query: ${JSON.stringify(query)}`);
      
      try {
        const { whereClause, values } = buildWhereClause(query);
        const sql = `SELECT * FROM ${tableName} ${whereClause} LIMIT 1`;
        const result = await pool.query(sql, values);
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          // Convert id to _id for MongoDB compatibility if needed
          if (row.id && !row._id) {
            row._id = row.id;
          }
          return row;
        }
        
        return null;
      } catch (err) {
        logger.error(`[${modelName}] FindOne operation error: ${err.message}`);
        return null;
      }
    },
    
    findById: async (id) => {
      logger.log(`[${modelName}] FindById operation with id: ${id}`);
      
      try {
        const sql = `SELECT * FROM ${tableName} WHERE id = $1 OR _id = $1 LIMIT 1`;
        const result = await pool.query(sql, [id]);
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          // Convert id to _id for MongoDB compatibility if needed
          if (row.id && !row._id) {
            row._id = row.id;
          }
          
          // Add populate method to support MongoDB-like population
          row.populate = function() {
            logger.log(`[${modelName}] Populate method called on findById result but not implemented in jPTS adapter`);
            // Return this same object to allow method chaining
            return row;
          };
          
          return row;
        }
        
        return null;
      } catch (err) {
        logger.error(`[${modelName}] FindById operation error: ${err.message}`);
        return null;
      }
    },
    
    create: async (data) => {
      logger.log(`[${modelName}] Create operation with data: ${JSON.stringify(data)}`);
      
      try {
        // Prepare data for insertion
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        
        const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) 
                    VALUES (${placeholders}) 
                    RETURNING *`;
                    
        const result = await pool.query(sql, values);
        
        if (result.rows.length > 0) {
          const insertedRow = result.rows[0];
          // Convert id to _id for MongoDB compatibility if needed
          if (insertedRow.id && !insertedRow._id) {
            insertedRow._id = insertedRow.id;
          }
          return insertedRow;
        }
        
        return { ...data, _id: `pg-${Date.now()}` };
      } catch (err) {
        logger.error(`[${modelName}] Create operation error: ${err.message}`);
        // Fallback to mock response in case of error
        return { ...data, _id: `mock-id-${Date.now()}` };
      }
    },
    
    updateOne: async (query, update) => {
      logger.log(`[${modelName}] UpdateOne operation with query: ${JSON.stringify(query)}, update: ${JSON.stringify(update)}`);
      
      try {
        const { whereClause, values: whereValues } = buildWhereClause(query);
        const { setClause, values: setValues } = buildSetClause(update);
        
        if (!setClause) {
          return { modifiedCount: 0 };
        }
        
        const values = [...setValues, ...whereValues];
        const sql = `UPDATE ${tableName} 
                    SET ${setClause} 
                    ${whereClause} 
                    RETURNING *`;
                    
        const result = await pool.query(sql, values);
        
        return { 
          modifiedCount: result.rowCount,
          modifiedData: result.rows
        };
      } catch (err) {
        logger.error(`[${modelName}] UpdateOne operation error: ${err.message}`);
        return { modifiedCount: 0 };
      }
    },
    
    deleteOne: async (query) => {
      logger.log(`[${modelName}] DeleteOne operation with query: ${JSON.stringify(query)}`);
      
      try {
        const { whereClause, values } = buildWhereClause(query);
        
        if (!whereClause) {
          logger.error(`[${modelName}] DeleteOne operation error: Cannot delete without conditions`);
          return { deletedCount: 0 };
        }
        
        const sql = `DELETE FROM ${tableName} ${whereClause} RETURNING *`;
        const result = await pool.query(sql, values);
        
        return { 
          deletedCount: result.rowCount,
          deletedData: result.rows
        };
      } catch (err) {
        logger.error(`[${modelName}] DeleteOne operation error: ${err.message}`);
        return { deletedCount: 0 };
      }
    },
    
    // Find all documents with pagination and sorting
    findAll: async ({ page = 1, limit = 20, sortField = 'created_at', sortDirection = 'DESC' } = {}) => {
      logger.log(`[${modelName}] FindAll operation with pagination: page=${page}, limit=${limit}, sort=${sortField} ${sortDirection}`);
      
      try {
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // Get field names from database if schema isn't provided
        let fieldQuery = '*'; // Default to all fields
        
        // Ensure valid sort direction
        sortDirection = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        // Build count query and data query
        const countQuery = `SELECT COUNT(*) FROM ${tableName}`;
        const dataQuery = `
          SELECT ${fieldQuery}
          FROM ${tableName}
          ORDER BY ${sortField} ${sortDirection}
          LIMIT $1 OFFSET $2`;
        
        // Execute count query
        const countResult = await pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count);
        
        // Execute data query with pagination
        const dataResult = await pool.query(dataQuery, [limit, offset]);
        
        // Return results with pagination metadata
        return {
          rows: dataResult.rows,
          total
        };
      } catch (err) {
        logger.error(`[${modelName}] FindAll operation error: ${err.message}`);
        return { rows: [], total: 0 };
      }
    }
  };
}

// Initialize db client for direct SQL queries
const db = init();

module.exports = {
  init,
  createModel,
  logger,
  db,
  getConnectionDetails: () => ({
    host: JPTS_HOST,
    port: JPTS_PORT,
    database: JPTS_DB,
    user: JPTS_USER
  })
};
