const mongoose = require('mongoose');

const TerminalSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  serial: String,
  config: Object,
  status: String,
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Terminal', TerminalSchema);
