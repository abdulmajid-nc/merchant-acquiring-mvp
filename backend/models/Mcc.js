// PostgreSQL model for MCC (Merchant Category Code)
const jptsAdapter = process.env.DB_TYPE === 'jpts' ? require('../jpts-adapter') : null;

class MccModel {
  constructor() {
    this.tableName = 'mccs';
    this.jpts = jptsAdapter ? jptsAdapter.init() : null;
  }

  // Create a new MCC
  async create(mccData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Validate code format
      if (!/^\d{4}$/.test(mccData.code)) {
        throw new Error('Invalid MCC code format. Must be a 4-digit number.');
      }
      
      // Add created_at if not present
      if (!mccData.created_at) {
        mccData.created_at = new Date();
      }
      
      const columns = Object.keys(mccData);
      const values = Object.values(mccData);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
                     VALUES (${placeholders}) 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating MCC:', error);
      throw error;
    }
  }

  // Find all MCCs
  async find() {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `SELECT * FROM ${this.tableName}`;
      const result = await this.jpts.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error finding MCCs:', error);
      throw error;
    }
  }

  // Find MCC by code
  async findOneByCode(code) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `SELECT * FROM ${this.tableName} WHERE code = $1`;
      const result = await this.jpts.query(query, [code]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error finding MCC with code ${code}:`, error);
      throw error;
    }
  }

  // Update MCC by code
  async updateByCode(code, updateData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // If updating the code, validate the new code
      if (updateData.code && !/^\d{4}$/.test(updateData.code)) {
        throw new Error('Invalid MCC code format. Must be a 4-digit number.');
      }
      
      const columns = Object.keys(updateData);
      const values = Object.values(updateData);
      
      // Create SET part of query: "column1 = $1, column2 = $2, ..."
      const setClause = columns
        .map((col, index) => `${col} = $${index + 1}`)
        .join(', ');
      
      const query = `UPDATE ${this.tableName} 
                     SET ${setClause} 
                     WHERE code = $${values.length + 1} 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, [...values, code]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error updating MCC with code ${code}:`, error);
      throw error;
    }
  }

  // Delete MCC by code
  async deleteByCode(code) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `DELETE FROM ${this.tableName} WHERE code = $1 RETURNING *`;
      const result = await this.jpts.query(query, [code]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error deleting MCC with code ${code}:`, error);
      throw error;
    }
  }
  
  // Find MCCs with pagination
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
      
      // Build order clause
      const orderClause = options.sort ? 
        `ORDER BY ${Object.entries(options.sort).map(([field, dir]) => `${field} ${dir === -1 ? 'DESC' : 'ASC'}`).join(', ')}` :
        'ORDER BY code ASC';
      
      // Get total count with this filter
      const countQuery = `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`;
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
        data: dataResult.rows,
        total
      };
    } catch (error) {
      console.error('Error finding MCCs with pagination:', error);
      throw error;
    }
  }
}

module.exports = new MccModel();
