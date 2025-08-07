const { getModel } = require('../models/ModelSelector');
const Transaction = getModel('Transaction');
const Merchant = getModel('Merchant');
const Terminal = getModel('Terminal');
const { TRANSACTION_STATUSES, TRANSACTION_TYPES, STATUS_CATEGORIES } = require('../constants');

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    console.log('API: Getting transactions');
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortParam = req.query.sort || '-created_at';
    
    console.log(`API: Pagination params - page: ${page}, limit: ${limit}, sort: ${sortParam}`);
    
    // Parse sort parameter - handle sort param with prefix for direction like -created_at
    const sortField = sortParam.startsWith('-') ? sortParam.substring(1) : sortParam;
    const sortDirection = sortParam.startsWith('-') ? 'DESC' : 'ASC';
    const sort = { [sortField]: sortDirection };
    
    console.log('API: Calling Transaction.findAll with params:', { page, limit, sort });
    console.log('Transaction model methods:', Object.keys(Transaction));
    
    // Fetch transactions from transactions table using the model
    const offset = (page - 1) * limit;
    
    if (typeof Transaction.findAll !== 'function') {
      console.error('Error: Transaction.findAll is not a function!', Transaction);
      return res.status(500).json({ message: 'Server error', error: 'Transaction.findAll is not a function' });
    }
    
    const { rows: transactions, total } = await Transaction.findAll({
      page,
      limit,
      sortField,
      sortDirection
    });
    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { 
      terminal, 
      merchant, 
      terminal_id,
      merchant_id,
      amount, 
      currency, 
      status, 
      transaction_type,
      reference,
      trace,
      card_scheme,
      masked_pan,
      mcc,
      pos_entry_mode,
      is_international,
      original_transaction,
      details 
    } = req.body;
    
    const transactionData = {
      terminal_id,
      merchant_id,
      amount,
      currency,
      status: status || TRANSACTION_STATUSES.PENDING,
      transaction_type,
      reference,
      trace,
      card_scheme,
      masked_pan,
      mcc,
      pos_entry_mode,
      is_international,
      original_transaction,
      details,
      created_at: new Date()
    };
    
    const newTransaction = await Transaction.create(transactionData);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const transaction = await Transaction.update(req.params.id, { status });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available transaction statuses and metadata
exports.getTransactionStatuses = async (req, res) => {
  try {
    // Return all status information including UI categories
    res.json({
      statuses: TRANSACTION_STATUSES,
      types: TRANSACTION_TYPES,
      categories: STATUS_CATEGORIES
    });
  } catch (error) {
    console.error('Error fetching transaction statuses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
