const mongoose = require('mongoose');

const ArchivedAccountSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  reason: String,
  archived_at: { type: Date, default: Date.now },
  data: Object
});

module.exports = mongoose.model('ArchivedAccount', ArchivedAccountSchema);
