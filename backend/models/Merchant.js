const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema({
  // Basic information
  name: String,
  email: String,
  phone: String,
  website: String,
  business_type: String,
  registration_number: String,
  tax_id: String,
  incorporation_date: Date,
  
  // Business details
  business_description: String,
  mcc_code: String,  // Merchant Category Code
  average_transaction_value: Number,
  estimated_monthly_volume: Number,
  operating_countries: [String],
  
  // Acquiring business specifics
  acquiring: {
    payment_methods: [String],  // e.g., 'visa', 'mastercard', 'amex', etc.
    terminal_types: [String],   // e.g., 'physical', 'virtual', 'mobile'
    service_level: {           // SLA options
      type: String,
      enum: ['standard', 'premium', 'enterprise'],
      default: 'standard'
    },
    pricing_model: {
      type: String,
      enum: ['interchange_plus', 'flat_rate', 'tiered', 'custom'],
      default: 'flat_rate'
    },
    settlement_currency: String,
    settlement_frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    requires_3ds: { type: Boolean, default: true },
    high_risk: { type: Boolean, default: false }
  },
  
  // Banking and settlement
  bank_details: {
    account_name: String,
    account_number: String,
    bank_name: String,
    bank_code: String,
    swift_bic: String,
    iban: String
  },
  
  // Compliance and documentation
  docs: [String],
  compliance_level: {
    type: String,
    enum: ['pending', 'basic', 'standard', 'full'],
    default: 'pending'
  },
  kyc_verified: { type: Boolean, default: false },
  risk_assessment: {
    level: { 
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    notes: String
  },
  
  // System fields
  status: { 
    type: String, 
    enum: ['pending', 'active', 'suspended', 'closed'],
    default: 'pending' 
  },
  owner: String,
  locations: [String],
  tier: String,
  config: Object,
  auditLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog' }],
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Merchant', MerchantSchema);
