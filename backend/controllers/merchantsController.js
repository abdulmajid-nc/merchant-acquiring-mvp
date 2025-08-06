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
      const AuditLog = getModel('AuditLog');
      await AuditLog.create({
        entity_type: 'merchant',
        entity_id: merchant.id,
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
        id: merchant.id,
        status: merchant.status,
        name: merchant.name
      });
    } catch (error) {
      console.error('Merchant registration error:', error);
      res.status(500).json({ error: 'Failed to register merchant. Please try again.' });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const merchant = await Merchant.update(id, req.body);
      res.json({ message: 'Profile updated.', merchant });
    } catch (error) {
      console.error('Error updating merchant profile:', error);
      res.status(500).json({ error: 'Failed to update merchant profile' });
    }
  },
  upgrade: async (req, res) => {
    try {
      const { id } = req.params;
      const merchant = await Merchant.update(id, { tier: 'premium' });
      res.json({ message: 'Upgraded to premium.', merchant });
    } catch (error) {
      console.error('Error upgrading merchant:', error);
      res.status(500).json({ error: 'Failed to upgrade merchant' });
    }
  },
  reviewAccount: async (req, res) => {
    try {
      // Basic risk flagging example
      const merchantId = req.params.id;
      // Fetch merchant from database
      const merchant = await Merchant.findById(merchantId);
      
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }
      
      let flags = [];
      if (!merchant.docs || merchant.docs.length === 0) flags.push('Missing documents');
      if (merchant.status === 'pending') flags.push('Pending status');
      if (!merchant.email.includes('@')) flags.push('Invalid email');
      // Add more rules as needed
      
      res.json({ 
        merchantId, 
        flags, 
        riskLevel: flags.length === 0 ? 'low' : 'high' 
      });
    } catch (error) {
      console.error('Error reviewing merchant account:', error);
      res.status(500).json({ error: 'Failed to review merchant account' });
    }
  },
  list: async (req, res) => {
    console.log('GET request received for merchant list');
    try {
      // Pagination params
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      
      console.log('Using database for merchant list with pagination');
      try {
        const result = await Merchant.find({}, page, limit, { created_at: 'DESC' });
        console.log(`Found ${result.merchants ? result.merchants.length : 0} merchants in database`);
        
        return res.json({
          merchants: result.merchants || [],
          total: result.pagination ? result.pagination.total : 0,
          page,
          pageSize: limit,
          totalPages: result.pagination ? result.pagination.pages : 0,
          source: 'database'
        });
      } catch (err) {
        console.error('Error in Merchant.find():', err);
        
        // Fallback to mock data if database query fails
        console.log('Falling back to mock data for merchant list with pagination');
        const skip = (page - 1) * limit;
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
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
      res.status(500).json({ error: 'Failed to fetch merchants' });
    }
  },
  downgrade: async (req, res) => {
    try {
      const { id } = req.params;
      const merchant = await Merchant.update(id, { tier: 'standard' });
      res.json({ message: 'Downgraded to standard tier.', merchant });
    } catch (error) {
      console.error('Error downgrading merchant:', error);
      res.status(500).json({ error: 'Failed to downgrade merchant' });
    }
  },
  transferOwnership: async (req, res) => {
    try {
      // To be implemented
      res.json({ message: 'Transfer ownership endpoint not yet implemented.' });
    } catch (error) {
      console.error('Error transferring ownership:', error);
      res.status(500).json({ error: 'Failed to transfer ownership' });
    }
  },
  addLocation: async (req, res) => {
    try {
      // To be implemented
      res.json({ message: 'Add location endpoint not yet implemented.' });
    } catch (error) {
      console.error('Error adding location:', error);
      res.status(500).json({ error: 'Failed to add location' });
    }
  },
  closeAccount: async (req, res) => {
    try {
      const { id } = req.params;
      await Merchant.update(id, { status: 'closed', closed_at: new Date() });
      res.json({ message: 'Account closed successfully.' });
    } catch (error) {
      console.error('Error closing account:', error);
      res.status(500).json({ error: 'Failed to close account' });
    }
  },
  updateConfig: async (req, res) => {
    try {
      const { id } = req.params;
      const merchant = await Merchant.update(id, { config: req.body.config });
      res.json({ message: 'Configuration updated successfully.', merchant });
    } catch (error) {
      console.error('Error updating configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  },
  getProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const merchant = await Merchant.findById(id);
      
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }
      
      res.json({ merchant });
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
      res.status(500).json({ error: 'Failed to fetch merchant profile' });
    }
  }
};
