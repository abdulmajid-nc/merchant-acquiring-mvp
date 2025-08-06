const { getModel } = require('../models/ModelSelector');

// Get all MCCs
exports.getAllMccs = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Check if we're connected to the database
    if (global.dbConnected) {
      console.log('Using database for MCCs list');
      
      // Get Mcc model dynamically to ensure we have the latest connection
      const Mcc = getModel('Mcc');
      
      if (!Mcc) {
        throw new Error('Mcc model not available');
      }
      
      // For jPTS adapter, find() doesn't support skip/limit directly
      // So we need to handle pagination differently based on adapter type
      let mccs;
      let total;
      
      if (process.env.DB_TYPE === 'jpts') {
        // For jPTS, get all records and handle pagination in memory
        // This is not efficient for large datasets but works for MCCs which are limited
        const allMccs = await Mcc.find();
        total = allMccs.length;
        mccs = allMccs.sort((a, b) => a.code.localeCompare(b.code)).slice(skip, skip + limit);
      } else {
        // For other database types
        const result = await Mcc.findPaginated(skip, limit, {}, { sort: { code: 1 } });
        mccs = result.data;
        total = result.total;
      }
      
      return res.status(200).json({
        mccs,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        source: 'database'
      });
    }
    
    // If not connected to database, use mock data
    console.log('Using mock data for MCCs list');
    
    // Make sure global.mccs exists
    if (!global.mccs) {
      global.mccs = [
        { code: '5411', description: 'Grocery Stores, Supermarkets', category: 'Food & Beverage', risk_level: 'low' },
        { code: '5812', description: 'Eating Places, Restaurants', category: 'Food & Beverage', risk_level: 'medium' },
        { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', category: 'Retail', risk_level: 'medium' }
      ];
    }
    
    // Apply pagination to mock data
    const total = global.mccs.length;
    const mccs = global.mccs.slice(skip, skip + limit);
    
    return res.status(200).json({
      mccs,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      source: 'mock'
    });
  } catch (error) {
    console.error('Error fetching MCCs:', error);
    
    // If there's an error, provide mock data for development
    if (global.mccs) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const total = global.mccs.length;
      const mccs = global.mccs.slice(skip, skip + limit);
      
      return res.status(200).json({
        mccs,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        source: 'mock (error fallback)',
        error: error.message
      });
    }
    
    res.status(500).json({ message: 'Error fetching MCCs', error: error.message });
  }
};

// Get MCC by code
exports.getMccByCode = async (req, res) => {
  try {
    // Check if we're connected to the database
    if (global.dbConnected) {
      console.log('Using database for MCC lookup');
      // Get Mcc model dynamically to ensure we have the latest connection
      const Mcc = getModel('Mcc');
      
      if (!Mcc) {
        throw new Error('Mcc model not available');
      }
      
      const mcc = await Mcc.findOneByCode(req.params.code);
      
      if (!mcc) {
        return res.status(404).json({ message: 'MCC not found', source: 'database' });
      }
      
      return res.status(200).json({
        mcc,
        source: 'database'
      });
    }
    
    // If not connected to database, use mock data
    console.log('Using mock data for MCC lookup');
    
    // Make sure global.mccs exists
    if (!global.mccs) {
      global.mccs = [
        { code: '5411', description: 'Grocery Stores, Supermarkets', risk_level: 'low' },
        { code: '5812', description: 'Eating Places, Restaurants', risk_level: 'medium' },
        { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', risk_level: 'medium' }
      ];
    }
    
    const mockMcc = global.mccs.find(m => m.code === req.params.code);
    
    if (!mockMcc) {
      return res.status(404).json({ message: 'MCC not found', source: 'mock' });
    }
    
    return res.status(200).json({
      mcc: mockMcc,
      source: 'mock'
    });
  } catch (error) {
    console.error('Error fetching MCC:', error);
    
    // If there's an error, try to provide mock data
    if (global.mccs) {
      const mockMcc = global.mccs.find(m => m.code === req.params.code);
      if (mockMcc) {
        return res.status(200).json({
          mcc: mockMcc,
          source: 'mock',
          error: error.message
        });
      }
    }
    
    res.status(500).json({ message: 'Error fetching MCC', error: error.message });
  }
};

// Create a new MCC
exports.createMcc = async (req, res) => {
  try {
    // Get Mcc model dynamically to ensure we have the latest connection
    const Mcc = getModel('Mcc');
    
    if (!Mcc) {
      throw new Error('Mcc model not available');
    }
    
    // Check if MCC already exists
    const existingMcc = await Mcc.findOneByCode(req.body.code);
    if (existingMcc) {
      return res.status(400).json({ message: 'MCC with this code already exists' });
    }
    
    // Validate that code is a 4-digit number
    if (!/^\d{4}$/.test(req.body.code)) {
      return res.status(400).json({ message: 'MCC code must be a 4-digit number' });
    }
    
    const mccData = {
      code: req.body.code,
      description: req.body.description,
      category: req.body.category,
      risk_level: req.body.risk_level || 'medium'
    };
    
    const savedMcc = await Mcc.create(mccData);
    res.status(201).json(savedMcc);
  } catch (error) {
    console.error('Error creating MCC:', error);
    res.status(500).json({ message: 'Error creating MCC', error: error.message });
  }
};

// Update an MCC
exports.updateMcc = async (req, res) => {
  try {
    // Get Mcc model dynamically to ensure we have the latest connection
    const Mcc = getModel('Mcc');
    
    if (!Mcc) {
      throw new Error('Mcc model not available');
    }
    
    // Validate that code is a 4-digit number if it's being updated
    if (req.body.code && !/^\d{4}$/.test(req.body.code)) {
      return res.status(400).json({ message: 'MCC code must be a 4-digit number' });
    }
    
    const updatedMcc = await Mcc.updateByCode(req.params.code, req.body);
    
    if (!updatedMcc) {
      return res.status(404).json({ message: 'MCC not found' });
    }
    
    res.status(200).json(updatedMcc);
  } catch (error) {
    console.error('Error updating MCC:', error);
    res.status(500).json({ message: 'Error updating MCC', error: error.message });
  }
};

// Delete an MCC
exports.deleteMcc = async (req, res) => {
  try {
    // Get Mcc model dynamically to ensure we have the latest connection
    const Mcc = getModel('Mcc');
    
    if (!Mcc) {
      throw new Error('Mcc model not available');
    }
    
    const deletedMcc = await Mcc.deleteByCode(req.params.code);
    
    if (!deletedMcc) {
      return res.status(404).json({ message: 'MCC not found' });
    }
    
    res.status(200).json({ message: 'MCC deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCC:', error);
    res.status(500).json({ message: 'Error deleting MCC', error: error.message });
  }
};
