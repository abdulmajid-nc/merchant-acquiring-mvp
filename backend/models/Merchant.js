const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema({
  name: String,
  email: String,
  business_type: String,
  docs: [String],
  status: { type: String, default: 'pending' },
  owner: String,
  locations: [String],
  tier: String,
  config: Object,
  auditLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog' }],
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Merchant', MerchantSchema);
