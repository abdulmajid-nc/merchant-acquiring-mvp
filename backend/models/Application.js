const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  type: String, // registration, upgrade, closure, transfer
  status: String,
  details: Object,
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Application', ApplicationSchema);
