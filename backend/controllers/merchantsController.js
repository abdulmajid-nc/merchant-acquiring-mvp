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
  list: async (req, res) => {
    console.log('GET request received for merchant list');
    try {
      // Pagination params
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      if (global.dbConnected) {
        console.log('Using MongoDB for merchant list with pagination');
        const total = await Merchant.countDocuments();
        const merchants = await Merchant.find().skip(skip).limit(limit);
        return res.json({
          merchants,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
          source: 'database'
        });
      }

      // If not connected to MongoDB, use mock data
      console.log('Using mock data for merchant list with pagination');
      const all = global.merchants || [];
      const total = all.length;
      const paged = all.slice(skip, skip + limit);
      return res.json({
        merchants: paged,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        source: 'mock'
      });
    } catch (error) {
      console.error('Error fetching merchants:', error);
      res.status(500).json({ error: 'Failed to fetch merchants' });
    }
  },
  downgrade: async (req, res) => {
    res.json({ message: 'Downgrade endpoint not yet implemented.' });
  },
  transferOwnership: async (req, res) => {
    res.json({ message: 'Transfer ownership endpoint not yet implemented.' });
  },
  addLocation: async (req, res) => {
    res.json({ message: 'Add location endpoint not yet implemented.' });
  },
  closeAccount: async (req, res) => {
    res.json({ message: 'Close account endpoint not yet implemented.' });
  },
  updateConfig: async (req, res) => {
    res.json({ message: 'Update config endpoint not yet implemented.' });
  },
  getProfile: async (req, res) => {
    res.json({ message: 'Get profile endpoint not yet implemented.' });
  }
};
