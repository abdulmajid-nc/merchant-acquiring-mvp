const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  terminal: { type: mongoose.Schema.Types.ObjectId, ref: 'Terminal' },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  amount: Number,
  currency: String,
  status: String,
  details: Object,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
