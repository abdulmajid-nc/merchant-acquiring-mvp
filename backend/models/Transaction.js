
// PostgreSQL model for Transaction
const jptsAdapter = process.env.DB_TYPE === 'jpts' ? require('../jpts-adapter') : null;
const { TRANSACTION_STATUSES, TRANSACTION_TYPES } = require('../constants');

class TransactionModel {
  // Make transaction statuses and types accessible from the model
  static get STATUSES() {
    return TRANSACTION_STATUSES;
  }
  
  static get TYPES() {
    return TRANSACTION_TYPES;
  }
  // Make the adapter accessible for debugging
  static get jpts() {
    return jptsAdapter ? jptsAdapter.init() : null;
  }
  constructor() {
    this.tableName = 'transactions';
    this.jpts = jptsAdapter ? jptsAdapter.init() : null;
  }

  // Create a new transaction
  async create(transactionData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Ensure created_at field
      if (!transactionData.created_at) {
        transactionData.created_at = new Date();
      }
      
      const columns = Object.keys(transactionData);
      const values = Object.values(transactionData);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
                     VALUES (${placeholders}) 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Find transaction by ID
  async findById(id) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      console.log(`[DEBUG] Transaction.findById called with id: ${id}, type: ${typeof id}`);
      
      // CRITICAL FIX: We need to handle different types of IDs and make sure our database query works
      // with the updated table structure that now only uses 'id' as the primary key
      
      // If the input is a string that can be converted to a number
      if (!isNaN(id) && id.toString().trim() !== '') {
        // Convert to number for use with 'id' column
        const numericId = parseInt(id, 10);
        console.log(`[DEBUG] Converted ID to numeric: ${numericId}`);
        
        // Try to find the transaction by its numeric ID
        const queryString = `
          SELECT 
            id, merchant_id::text as merchant_id, terminal_id::text as terminal_id, 
            amount, currency, status, type as transaction_type, created_at,
            card_number, auth_code as approval_code, reference
          FROM ${this.tableName} 
          WHERE id = $1
        `;
        console.log(`[DEBUG] Running SQL query: ${queryString} with params: [${numericId}]`);
        const result = await this.jpts.query(queryString, [numericId]);
        
        console.log(`[DEBUG] SQL query result:`, result.rows);
        if (result.rows.length > 0) {
          console.log(`[DEBUG] Found transaction by numeric ID: ${numericId}`);
          // Convert amount to a number
          const transaction = result.rows[0];
          if (transaction.amount) {
            transaction.amount = parseFloat(transaction.amount);
          }
          return transaction;
        } else {
          console.log(`[DEBUG] No transaction found with numeric ID: ${numericId}`);
        }
      }
      
      // If the ID is a string, or the numeric lookup failed, try as reference
      // This provides a fallback mechanism
      if (typeof id === 'string' && id.trim() !== '') {
        console.log(`[DEBUG] Trying to find transaction by reference: ${id}`);
        // The _id column has been removed, so we skip the _id check and directly try reference
        
        // Try as a reference
        const refResult = await this.jpts.query(`
          SELECT 
            id, merchant_id::text as merchant_id, terminal_id::text as terminal_id, 
            amount, currency, status, type as transaction_type, created_at,
            card_number as masked_pan, auth_code as approval_code, reference
          FROM ${this.tableName} 
          WHERE reference = $1
        `, [id]);
        
        console.log(`[DEBUG] Reference search result:`, refResult.rows);
        if (refResult.rows.length > 0) {
          console.log(`[DEBUG] Found transaction by reference: ${id}`);
          // Convert amount to a number
          const transaction = refResult.rows[0];
          if (transaction.amount) {
            transaction.amount = parseFloat(transaction.amount);
          }
          return transaction;
        } else {
          console.log(`[DEBUG] No transaction found with reference: ${id}`);
        }
      }
      
      console.log(`[DEBUG] No transaction found with ID: ${id}`);
      // If all lookups failed, return null
      return null;
    } catch (error) {
      console.error(`Error finding transaction with id ${id}:`, error);
      throw error;
    }
  }

  // Find all transactions with pagination and sorting
  async findAll({ page = 1, limit = 20, sortField = 'created_at', sortDirection = 'DESC' } = {}) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Ensure valid sort field (prevent SQL injection)
      const validSortFields = ['created_at', 'amount', 'status', 'merchant_id', 'terminal_id', 'id', 'currency', 'card_number'];
      if (!validSortFields.includes(sortField)) {
        sortField = 'created_at';
      }
      
      // Ensure valid sort direction
      sortDirection = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      // Build the query with proper sorting and pagination
      const countQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
      const query = `
        SELECT 
          t.id, t.merchant_id::text as merchant_id, t.terminal_id::text as terminal_id, 
          t.amount, t.currency, t.status, t.type as transaction_type, t.created_at,
          COALESCE(t.card_number, t.masked_pan) as card_number,
          t.auth_code as approval_code, t.reference,
          m.name as merchant_name,
          CASE 
            WHEN t.card_number LIKE '4%' THEN 'Visa'
            WHEN t.card_number LIKE '5%' THEN 'MasterCard'
            WHEN t.card_number LIKE '3%' THEN 'Amex'
            WHEN t.card_number LIKE '6%' THEN 'Discover'
            ELSE 'Card'
          END as card_scheme,
          SUBSTRING(COALESCE(t.card_number, t.masked_pan), LENGTH(COALESCE(t.card_number, t.masked_pan)) - 3, 4) as card_last4
        FROM ${this.tableName} t
        LEFT JOIN merchants m ON t.merchant_id = m.id
        ORDER BY t.${sortField} ${sortDirection}
        LIMIT $1 OFFSET $2
      `;
      
      // Execute the count query to get total records
      const countResult = await this.jpts.query(countQuery);
      const total = parseInt(countResult.rows[0].count);
      
      // Execute the main query with pagination
      console.log('Executing transaction query with merchant join:', query);
      const result = await this.jpts.query(query, [limit, offset]);
      
      console.log('Raw transaction results (first row):', result.rows.length > 0 ? JSON.stringify(result.rows[0], null, 2) : 'No results');
      
      // Convert amount field to number before sending to frontend
      const processedRows = result.rows.map(row => {
        console.log(`Processing row ID ${row.id}, merchant_id: ${row.merchant_id}, merchant_name: ${row.merchant_name}`);
        return {
          ...row,
          amount: parseFloat(row.amount),
          // Ensure merchant_name is populated
          merchant_name: row.merchant_name || `Merchant ID: ${row.merchant_id}`,
          card_display: row.card_number ? `**** ${row.card_last4}` : row.card_number // Add a formatted card display
        };
      });
      
      return {
        rows: processedRows,
        total
      };
    } catch (error) {
      console.error('Error in Transaction.findAll:', error);
      throw error;
    }
  }

  // Find transactions by terminal ID
  async findByTerminalId(terminalId) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `
        SELECT t.*, m.name as merchant_name 
        FROM ${this.tableName} t
        LEFT JOIN merchants m ON t.merchant_id = m.id
        WHERE t.terminal_id = $1 
        ORDER BY t.created_at DESC`;
      const result = await this.jpts.query(query, [terminalId]);
      return result.rows;
    } catch (error) {
      console.error(`Error finding transactions for terminal ${terminalId}:`, error);
      throw error;
    }
  }
  

    } catch (error) {
      console.error('Error finding transactions:', error);
      throw error;
    }
  }

    // Find transaction by merchant and terminal
  async findByMerchantAndTerminal(merchantId, terminalId, page = 1, limit = 20) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const offset = (page - 1) * limit;
      
      const query = `SELECT 
                       id, merchant_id::text as merchant_id, terminal_id::text as terminal_id, 
                       amount, currency, status, type as transaction_type, created_at,
                       card_number as masked_pan, auth_code as approval_code, reference
                     FROM ${this.tableName} 
                     WHERE merchant_id = $1 
                     AND terminal_id = $2 
                     ORDER BY created_at DESC
                     LIMIT $3 OFFSET $4`;
      
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} 
                          WHERE merchant_id = $1 
                          AND terminal_id = $2`;
                          
      const [result, countResult] = await Promise.all([
        this.jpts.query(query, [merchantId, terminalId, limit, offset]),
        this.jpts.query(countQuery, [merchantId, terminalId])
      ]);
      
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      // Convert amount to number
      const processedRows = result.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount)
      }));
      
      return {
        transactions: processedRows,
        pagination: {
          total,
          page,
          limit,
          pages: totalPages
        }
      };
    } catch (error) {
      console.error(`Error finding transactions for merchant ${merchantId} and terminal ${terminalId}:`, error);
      throw error;
    }
  }

  // Update transaction by ID
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
      console.error(`Error updating transaction with id ${id}:`, error);
      throw error;
    }
  }

  // Find transactions with pagination and filtering
  async find(filter = {}, page = 1, limit = 20, sort = { created_at: 'DESC' }) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const offset = (page - 1) * limit;
      
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
        SELECT 
          id, _id, merchant_id::text as merchant_id, terminal_id::text as terminal_id, 
          amount, currency, status, type as transaction_type, created_at,
          card_number as masked_pan, auth_code as approval_code, reference
        FROM ${this.tableName} 
        ${whereClause} 
        ${orderClause} 
        LIMIT $${whereParams.length + 1} 
        OFFSET $${whereParams.length + 2}`;
      
      console.log('Executing transaction query:', dataQuery);
      console.log('With parameters:', [...whereParams, limit, offset]);
      
      const dataResult = await this.jpts.query(dataQuery, [...whereParams, limit, offset]);
      console.log('Transaction query result:', dataResult.rows.length ? 'Found transactions' : 'No transactions found');
      
      return {
        transactions: dataResult.rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding transactions:', error);
      throw error;
    }
  }
}

module.exports = new TransactionModel();
