// PostgreSQL model for Terminal
const jptsAdapter = process.env.DB_TYPE === 'jpts' ? require('../jpts-adapter') : null;

// Define the base model that can be used with any database adapter
class TerminalModel {
  constructor() {
    this.tableName = 'terminals';
    this.jpts = jptsAdapter ? jptsAdapter.init() : null;
  }

  // Create a new terminal
  async create(terminalData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Ensure created_at field
      if (!terminalData.created_at) {
        terminalData.created_at = new Date();
      }
      
      const columns = Object.keys(terminalData);
      const values = Object.values(terminalData);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
                     VALUES (${placeholders}) 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating terminal:', error);
      throw error;
    }
  }

  // Find terminal by ID
  async findById(id) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.jpts.query(query, [id]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error finding terminal with id ${id}:`, error);
      throw error;
    }
  }

  // Update terminal by ID
  async update(id, updateData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Add updated_at timestamp
      updateData.updated_at = new Date();
      
      const columns = Object.keys(updateData);
      const values = Object.values(updateData);
      
      // Create SET part of query: "column1 = $1, column2 = $2, ..."
      const setClause = columns
        .map((col, index) => `${col} = $${index + 1}`)
        .join(', ');
      
      const query = `UPDATE ${this.tableName} 
                     SET ${setClause} 
                     WHERE id = $${values.length + 1} 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, [...values, id]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error updating terminal with id ${id}:`, error);
      throw error;
    }
  }

  // Find terminals with filters and pagination
  async find(filter = {}) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Build WHERE clause from filter
      let whereClause = '';
      let whereParams = [];
      
      if (Object.keys(filter).length > 0) {
        const conditions = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(filter)) {
          conditions.push(`${key} = $${paramIndex}`);
          whereParams.push(value);
          paramIndex++;
        }
        
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
      
      // Get results
      const query = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY created_at DESC`;
      const result = await this.jpts.query(query, whereParams);
      return result.rows;
    } catch (error) {
      console.error('Error finding terminals:', error);
      throw error;
    }
  }
  
  // Count total terminals
  async count() {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `SELECT COUNT(*) AS total FROM ${this.tableName}`;
      const result = await this.jpts.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error counting terminals:', error);
      throw error;
    }
  }
  
  // Count terminals with filter
  async countWhere(filter = {}) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Build WHERE clause from filter
      let whereClause = '';
      let whereParams = [];
      
      if (Object.keys(filter).length > 0) {
        const conditions = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(filter)) {
          // Handle special conditions like $ne (not equal)
          if (typeof value === 'object' && value !== null) {
            if (value.$ne !== undefined) {
              conditions.push(`${key} != $${paramIndex}`);
              whereParams.push(value.$ne);
              paramIndex++;
            }
          } else {
            conditions.push(`${key} = $${paramIndex}`);
            whereParams.push(value);
            paramIndex++;
          }
        }
        
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
      
      const query = `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`;
      const result = await this.jpts.query(query, whereParams);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('Error counting terminals with filter:', error);
      throw error;
    }
  }
  
  // Find terminals with pagination
  async findPaginated(skip, limit, filter = {}, options = {}) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Build WHERE clause from filter
      let whereClause = '';
      let whereParams = [];
      
      if (Object.keys(filter).length > 0) {
        const conditions = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(filter)) {
          conditions.push(`${key} = $${paramIndex}`);
          whereParams.push(value);
          paramIndex++;
        }
        
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
      
      // Get total count with this filter
      const countQuery = `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`;
      const countResult = await this.jpts.query(countQuery, whereParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Build order clause
      const orderClause = options.sort ? 
        `ORDER BY ${Object.entries(options.sort).map(([field, dir]) => `${field} ${dir === -1 ? 'DESC' : 'ASC'}`).join(', ')}` :
        'ORDER BY created_at DESC';
      
      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${this.tableName} 
        ${whereClause} 
        ${orderClause} 
        LIMIT $${whereParams.length + 1} 
        OFFSET $${whereParams.length + 2}`;
      
      const dataResult = await this.jpts.query(dataQuery, [...whereParams, limit, skip]);
      
      return {
        data: dataResult.rows,
        total,
        page: Math.floor(skip / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error finding terminals with pagination:', error);
      throw error;
    }
  }
}

module.exports = new TerminalModel();
