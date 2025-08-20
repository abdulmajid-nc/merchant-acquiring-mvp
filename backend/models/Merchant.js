// PostgreSQL model for Merchant
const jptsAdapter = process.env.DB_TYPE === 'jpts' ? require('../jpts-adapter') : null;

// Define the base model that can be used with any database adapter
class MerchantModel {
  constructor() {
    this.tableName = 'merchants';
    this.jpts = jptsAdapter ? jptsAdapter.init() : null;
  }

  // Create a new merchant
  async create(merchantData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const columns = Object.keys(merchantData);
      const values = Object.values(merchantData);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
                     VALUES (${placeholders}) 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  }

  // Find merchant by ID
  async findById(id) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.jpts.query(query, [id]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error finding merchant with id ${id}:`, error);
      throw error;
    }
  }
  
  // Find multiple merchants by their IDs
  async findByIds(ids) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      if (!ids || !ids.length) {
        return [];
      }
      
      // Create placeholders for SQL query ($1, $2, etc.)
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
      const query = `SELECT id, name FROM ${this.tableName} WHERE id IN (${placeholders})`;
      
      console.log(`Finding merchants with IDs: ${ids.join(', ')}`);
      const result = await this.jpts.query(query, ids);
      return result.rows;
    } catch (error) {
      console.error(`Error finding merchants with ids [${ids.join(', ')}]:`, error);
      throw error;
    }
  }

  // Update merchant by ID
  async update(id, updateData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const columns = Object.keys(updateData);
      const values = Object.values(updateData);
      
      // Create SET part of query: "column1 = $1, column2 = $2, ..."
      const setClause = columns
        .map((col, index) => `${col} = $${index + 1}`)
        .join(', ');
      
      const query = `UPDATE ${this.tableName} 
                     SET ${setClause}, updated_at = NOW() 
                     WHERE id = $${values.length + 1} 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, [...values, id]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error updating merchant with id ${id}:`, error);
      throw error;
    }
  }

  // Find merchants with pagination
  async findPaginated(skip, limit, filter = {}) {
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
      
      // Get total count
      const countQuery = `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`;
      const countResult = await this.jpts.query(countQuery, whereParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Get paginated results
      const dataQuery = `SELECT * FROM ${this.tableName} 
                         ${whereClause} 
                         ORDER BY created_at DESC 
                         LIMIT $${whereParams.length + 1} 
                         OFFSET $${whereParams.length + 2}`;
                         
      const dataResult = await this.jpts.query(dataQuery, [...whereParams, limit, skip]);
      const merchants = dataResult.rows;
      
      return { total, merchants };
    } catch (error) {
      console.error('Error finding merchants with pagination:', error);
      throw error;
    }
  }

  // Find merchants with pagination (alternate version)
  async find(filter = {}, page = 1, limit = 20, sort = { created_at: 'DESC' }) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const skip = (page - 1) * limit;
      
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
      
      // Build order clause
      const sortFields = Object.entries(sort).map(([field, direction]) => 
        `${field} ${direction.toUpperCase()}`
      ).join(', ');
      
      const orderClause = sortFields ? `ORDER BY ${sortFields}` : 'ORDER BY created_at DESC';
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const countResult = await this.jpts.query(countQuery, whereParams);
      const total = parseInt(countResult.rows[0].total);
      
      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${this.tableName} 
        ${whereClause} 
        ${orderClause} 
        LIMIT $${whereParams.length + 1} 
        OFFSET $${whereParams.length + 2}`;
      
      const dataResult = await this.jpts.query(dataQuery, [...whereParams, limit, skip]);
      
      return {
        merchants: dataResult.rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding merchants:', error);
      throw error;
    }
  }
}

module.exports = new MerchantModel();
