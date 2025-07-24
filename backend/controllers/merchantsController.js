const Merchant = require('../models/Merchant');

module.exports = {
  bulkCreate: (req, res) => {
    // Parse CSV and create merchants
    const merchants = [];
    // Assume req.files.csv is available (use multer for file upload)
    // For demo, just return success
    res.json({ message: 'Bulk account creation successful.', merchants });
  },
  getTemplates: (req, res) => {
    // Return hardcoded templates
    res.json({ templates: [
      { name: 'retail', fields: ['name', 'email', 'bank'] },
      { name: 'e-commerce', fields: ['name', 'email', 'catalog', 'bank'] },
      { name: 'service', fields: ['name', 'email', 'serviceType', 'bank'] }
    ] });
  },
  createTemplate: (req, res) => {
    // Accept template in body
    res.json({ message: 'Template created.', template: req.body });
  },
  register: async (req, res) => {
    // Create merchant from req.body
    const merchant = await Merchant.create(req.body);
    res.json({ message: 'Registration successful.', merchant });
  },
  updateProfile: async (req, res) => {
    const { id } = req.params;
    const merchant = await Merchant.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: 'Profile updated.', merchant });
  },
  upgrade: async (req, res) => {
    const { id } = req.params;
    const merchant = await Merchant.findByIdAndUpdate(id, { tier: 'premium' }, { new: true });
    res.json({ message: 'Upgraded to premium.', merchant });
  },
  downgrade: async (req, res) => {
    const { id } = req.params;
    const merchant = await Merchant.findByIdAndUpdate(id, { tier: 'standard' }, { new: true });
    res.json({ message: 'Downgraded to standard.', merchant });
  },
  transferOwnership: async (req, res) => {
    const { id } = req.params;
    const { newOwner } = req.body;
    const merchant = await Merchant.findByIdAndUpdate(id, { owner: newOwner }, { new: true });
    res.json({ message: 'Ownership transferred.', merchant });
  },
  addLocation: async (req, res) => {
    const { id } = req.params;
    const { location } = req.body;
    const merchant = await Merchant.findById(id);
    merchant.locations.push(location);
    await merchant.save();
    res.json({ message: 'Location added.', merchant });
  },
  closeAccount: async (req, res) => {
    const { id } = req.params;
    const merchant = await Merchant.findByIdAndUpdate(id, { status: 'closed' }, { new: true });
    res.json({ message: 'Account closed.', merchant });
  },
  updateConfig: async (req, res) => {
    const { id } = req.params;
    const merchant = await Merchant.findByIdAndUpdate(id, { config: req.body }, { new: true });
    res.json({ message: 'Config updated.', merchant });
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
    const { id } = req.params;
    const merchant = await Merchant.findById(id);
    res.json({ merchant });
  },
  list: async (req, res) => {
    const merchants = await Merchant.find();
    res.json({ merchants });
  }
};
