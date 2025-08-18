/**
 * Transaction Service
 * Handles transaction processing and interactions with transaction data
 */
const jptsAdapter = require('../jpts-adapter');
const { TRANSACTION_STATUSES, TRANSACTION_TYPES } = require('../constants');

class TransactionService {
  constructor() {
    this.jpts = jptsAdapter.init();
  }

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  async createTransaction(transactionData) {
    try {
      // Ensure transaction model exists
      if (!global.models || !global.models.Transaction) {
        throw new Error('Transaction model not initialized');
      }

      // Default values if not provided
      const now = new Date();
      const transaction = {
        merchant_id: transactionData.merchant_id,
        terminal_id: transactionData.terminal_id,
        amount: transactionData.amount,
        status: transactionData.status || TRANSACTION_STATUSES.PENDING,
        type: transactionData.type || TRANSACTION_TYPES.PURCHASE,
        reference_id: transactionData.reference_id || `TRX-${Date.now()}`,
        card_number: transactionData.card_number,
        created_at: now,
        updated_at: now,
        ...transactionData
      };

      // If fee calculation is needed, call fee service
      if (transactionData.calculate_fees) {
        try {
          // Try to load fee service if it exists
          const FeeService = require('./feeService');
          const feeService = new FeeService();
          
          const fees = await feeService.calculateTransactionFees(
            transaction.merchant_id,
            transaction.amount,
            transaction.type
          );
          
          transaction.fee_amount = fees.total_fee;
          transaction.fee_breakdown = JSON.stringify(fees);
        } catch (error) {
          console.error('Error calculating fees:', error.message);
          // If fee service fails, continue without fees
          transaction.fee_amount = 0;
        }
      }

      // Use the global model for persistence
      const result = await global.models.Transaction.create(transaction);
      return result;
    } catch (error) {
      console.error('Error in TransactionService.createTransaction:', error);
      throw error;
    }
  }

  /**
   * Get a transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} - Transaction object
   */
  async getTransactionById(transactionId) {
    try {
      return await global.models.Transaction.findOne({ id: transactionId });
    } catch (error) {
      console.error('Error in TransactionService.getTransactionById:', error);
      throw error;
    }
  }

  /**
   * Get transactions by merchant ID
   * @param {string} merchantId - Merchant ID
   * @param {Object} options - Query options (limit, offset, etc.)
   * @returns {Promise<Array>} - List of transactions
   */
  async getTransactionsByMerchantId(merchantId, options = {}) {
    try {
      const query = { merchant_id: merchantId };
      
      // Handle sorting and pagination
      const sort = options.sort || { created_at: -1 };
      const limit = options.limit || 50;
      const skip = options.skip || 0;
      
      return await global.models.Transaction.find(query, { sort, limit, skip });
    } catch (error) {
      console.error('Error in TransactionService.getTransactionsByMerchantId:', error);
      throw error;
    }
  }

  /**
   * Update a transaction
   * @param {string} transactionId - Transaction ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated transaction
   */
  async updateTransaction(transactionId, updateData) {
    try {
      // Don't allow changing certain fields
      delete updateData.merchant_id;
      delete updateData.created_at;
      
      // Update timestamp
      updateData.updated_at = new Date();

      return await global.models.Transaction.findOneAndUpdate(
        { id: transactionId },
        { $set: updateData },
        { returnOriginal: false }
      );
    } catch (error) {
      console.error('Error in TransactionService.updateTransaction:', error);
      throw error;
    }
  }

  /**
   * Generate transaction statistics for a merchant
   * @param {string} merchantId - Merchant ID
   * @param {Object} options - Options for filtering (timeframe, etc.)
   * @returns {Promise<Object>} - Transaction statistics
   */
  async getTransactionStats(merchantId, options = {}) {
    try {
      // Default to last 30 days if not specified
      const endDate = options.endDate || new Date();
      const startDate = options.startDate || new Date(endDate - 30 * 24 * 60 * 60 * 1000);
      
      // Get total volume and count
      const totalQuery = `
        SELECT 
          COUNT(*) as count,
          SUM(amount) as volume,
          AVG(amount) as average_value
        FROM 
          transactions
        WHERE 
          merchant_id = $1
          AND created_at BETWEEN $2 AND $3
          AND status = 'completed'
      `;
      
      const totalResult = await this.jpts.query(totalQuery, [merchantId, startDate, endDate]);
      
      // Get volume by day
      const volumeByDayQuery = `
        SELECT 
          DATE_TRUNC('day', created_at) as day,
          SUM(amount) as volume,
          COUNT(*) as count
        FROM 
          transactions
        WHERE 
          merchant_id = $1
          AND created_at BETWEEN $2 AND $3
          AND status = 'completed'
        GROUP BY 
          DATE_TRUNC('day', created_at)
        ORDER BY 
          day ASC
      `;
      
      const volumeByDayResult = await this.jpts.query(volumeByDayQuery, [merchantId, startDate, endDate]);
      
      // Calculate growth rates
      const stats = {
        total_volume: totalResult.rows[0]?.volume || 0,
        total_count: parseInt(totalResult.rows[0]?.count, 10) || 0,
        average_value: totalResult.rows[0]?.average_value || 0,
        volume_by_day: volumeByDayResult.rows || []
      };
      
      return stats;
    } catch (error) {
      console.error('Error in TransactionService.getTransactionStats:', error);
      throw error;
    }
  }
}

module.exports = TransactionService;
