const Merchant = require('../models/Merchant');

module.exports = {
  bulkCreate: (req, res) => {
    // TODO: Implement bulk creation (CSV upload)
    res.json({ message: 'Bulk account creation not yet implemented.' });
  },
  getTemplates: (req, res) => {
    // TODO: Return merchant type templates
    res.json({ templates: [] });
  },
  createTemplate: (req, res) => {
    // TODO: Create a new merchant template
    res.json({ message: 'Template creation not yet implemented.' });
  },
  register: async (req, res) => {
    // TODO: Implement self-service registration
    res.json({ message: 'Registration not yet implemented.' });
  },
  updateProfile: async (req, res) => {
    // TODO: Implement profile update
    res.json({ message: 'Profile update not yet implemented.' });
  },
  upgrade: async (req, res) => {
    // TODO: Implement upgrade
    res.json({ message: 'Upgrade not yet implemented.' });
  },
  downgrade: async (req, res) => {
    // TODO: Implement downgrade
    res.json({ message: 'Downgrade not yet implemented.' });
  },
  transferOwnership: async (req, res) => {
    // TODO: Implement ownership transfer
    res.json({ message: 'Ownership transfer not yet implemented.' });
  },
  addLocation: async (req, res) => {
    // TODO: Implement multi-location support
    res.json({ message: 'Add location not yet implemented.' });
  },
  closeAccount: async (req, res) => {
    // TODO: Implement account closure/archival
    res.json({ message: 'Account closure not yet implemented.' });
  },
  updateConfig: async (req, res) => {
    // TODO: Implement custom config update
    res.json({ message: 'Config update not yet implemented.' });
  },
  reviewAccount: async (req, res) => {
    // Basic risk flagging example
    const merchantId = req.params.id;
    // Simulate fetching merchant and running checks
    // In real code, fetch from DB: const merchant = await Merchant.findById(merchantId);
    const merchant = { id: merchantId, status: 'pending', email: 'test@example.com', docs: ['doc1'], business_type: 'retail' };
    let flags = [];
    if (!merchant.docs || merchant.docs.length === 0) flags.push('Missing documents');
    if (merchant.status === 'pending') flags.push('Pending status');
    if (!merchant.email.includes('@')) flags.push('Invalid email');
    // Add more rules as needed
    res.json({ merchantId, flags, riskLevel: flags.length === 0 ? 'low' : 'high' });
  },
  getProfile: async (req, res) => {
    // TODO: Return merchant profile
    res.json({ message: 'Get profile not yet implemented.' });
  },
  list: async (req, res) => {
    // TODO: List all merchants
    res.json({ merchants: [] });
  }
};
