const mongoose = require('mongoose');
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
    try {
      // Validate required fields
      const { name, email, business_type } = req.body;
      
      if (!name || !email || !business_type) {
        return res.status(400).json({ 
          error: 'Missing required fields. Name, email, and business type are required.' 
        });
      }
      
      // Process bank details if provided
      if (req.body.bank_details) {
        // Validate basic bank details
        const { account_name, account_number, bank_name } = req.body.bank_details;
        if (account_name || account_number || bank_name) {
          // Ensure all three fields are provided if any one is provided
          if (!account_name || !account_number || !bank_name) {
            return res.status(400).json({ 
              error: 'Incomplete bank details. Account name, account number, and bank name are all required.' 
            });
          }
        }
      }
      
      // Process and format the data as needed
      const merchantData = {
        ...req.body,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Create merchant record
      const merchant = await Merchant.create(merchantData);
      
      // Create an audit log entry for the registration
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        entity_type: 'merchant',
        entity_id: merchant._id,
        action: 'register',
        user: 'system',
        details: {
          source: 'web_form',
          ip_address: req.ip || 'unknown'
        },
        timestamp: new Date()
      });
      
      res.json({ 
        message: 'Registration successful.', 
        id: merchant._id,
        status: merchant.status,
        name: merchant.name
      });
    } catch (error) {
      console.error('Merchant registration error:', error);
      res.status(500).json({ error: 'Failed to register merchant. Please try again.' });
    }
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
    console.log('GET request received for merchant ID:', id);
    
    try {
      // Check if we're connected to the database
      if (global.dbConnected) {
        console.log('Using MongoDB for merchant profile');
        // For MongoDB, we'd use the actual ObjectId
        const merchant = await Merchant.findById(id);
        if (merchant) {
          return res.json({
            merchant,
            source: 'database'
          });
        }
      }
      
      // If not connected to MongoDB or merchant not found, use mock data
      console.log('Using mock data for merchant ID:', id);
      const mockMerchant = global.merchants.find(m => m.id.toString() === id.toString());
      if (mockMerchant) {
        return res.json({
          merchant: mockMerchant,
          source: 'mock'
        });
      }
      
      return res.status(404).json({ error: 'Merchant not found', source: 'mock' });
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
      
      // If there's an error, provide mock data for development
      try {
        const mockMerchant = global.merchants.find(m => m.id.toString() === id.toString());
        if (mockMerchant) {
          console.log('Returning mock data for merchant ID:', id);
          return res.json({
            merchant: mockMerchant,
            source: 'mock',
            error: error.message
          });
        }
      } catch (fallbackError) {
        console.error('Error using mock data:', fallbackError);
      }
      
      res.status(500).json({ error: 'Failed to fetch merchant profile' });
    }
  },
  list: async (req, res) => {
    console.log('GET request received for merchant list');
    
    try {
      // Check if we're connected to the database
      if (global.dbConnected) {
        console.log('Using MongoDB for merchant list');
        const merchants = await Merchant.find();
        return res.json({
          merchants,
          total: merchants.length,
          source: 'database'
        });
      }
      
      // If not connected to MongoDB, use mock data
      console.log('Using mock data for merchant list');
      return res.json({
        merchants: global.merchants,
        total: global.merchants.length,
        source: 'mock'
      });
      
    } catch (error) {
      console.error('Error fetching merchant list:', error);
      
      // If there's an error, provide mock data for development
      console.log('Returning mock data for merchant list due to error');
      return res.json({
        merchants: global.merchants || [],
        total: global.merchants ? global.merchants.length : 0,
        source: 'mock',
        error: error.message
      });
    }
  }
};
