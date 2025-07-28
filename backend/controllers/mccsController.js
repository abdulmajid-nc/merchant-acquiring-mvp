const Mcc = require('../models/Mcc');

// Get all MCCs
exports.getAllMccs = async (req, res) => {
  try {
    const mccs = await Mcc.find().sort({ code: 1 });
    res.status(200).json(mccs);
  } catch (error) {
    console.error('Error fetching MCCs:', error);
    res.status(500).json({ message: 'Error fetching MCCs', error: error.message });
  }
};

// Get MCC by code
exports.getMccByCode = async (req, res) => {
  try {
    const mcc = await Mcc.findOne({ code: req.params.code });
    
    if (!mcc) {
      return res.status(404).json({ message: 'MCC not found' });
    }
    
    res.status(200).json(mcc);
  } catch (error) {
    console.error('Error fetching MCC:', error);
    res.status(500).json({ message: 'Error fetching MCC', error: error.message });
  }
};

// Create a new MCC
exports.createMcc = async (req, res) => {
  try {
    // Check if MCC already exists
    const existingMcc = await Mcc.findOne({ code: req.body.code });
    if (existingMcc) {
      return res.status(400).json({ message: 'MCC with this code already exists' });
    }
    
    // Validate that code is a 4-digit number
    if (!/^\d{4}$/.test(req.body.code)) {
      return res.status(400).json({ message: 'MCC code must be a 4-digit number' });
    }
    
    const newMcc = new Mcc({
      code: req.body.code,
      description: req.body.description,
      category: req.body.category
    });
    
    const savedMcc = await newMcc.save();
    res.status(201).json(savedMcc);
  } catch (error) {
    console.error('Error creating MCC:', error);
    res.status(500).json({ message: 'Error creating MCC', error: error.message });
  }
};

// Update an MCC
exports.updateMcc = async (req, res) => {
  try {
    // Validate that code is a 4-digit number if it's being updated
    if (req.body.code && !/^\d{4}$/.test(req.body.code)) {
      return res.status(400).json({ message: 'MCC code must be a 4-digit number' });
    }
    
    const updatedMcc = await Mcc.findOneAndUpdate(
      { code: req.params.code },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
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
    const deletedMcc = await Mcc.findOneAndDelete({ code: req.params.code });
    
    if (!deletedMcc) {
      return res.status(404).json({ message: 'MCC not found' });
    }
    
    res.status(200).json({ message: 'MCC deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCC:', error);
    res.status(500).json({ message: 'Error deleting MCC', error: error.message });
  }
};
