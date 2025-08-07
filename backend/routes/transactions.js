const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

// GET /api/transactions/statuses - Get available transaction statuses
router.get('/statuses', transactionsController.getTransactionStatuses);

// GET /api/transactions - Get all transactions
router.get('/', transactionsController.getTransactions);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', transactionsController.getTransactionById);

// POST /api/transactions - Create a new transaction
router.post('/', transactionsController.createTransaction);

// PUT /api/transactions/:id/status - Update transaction status
router.put('/:id/status', transactionsController.updateTransactionStatus);

module.exports = router;
