const express = require('express');
const router = express.Router();

// In-memory pricing storage (for demo purposes)
// In a real app, this would be stored in a database
let merchantPricing = {};

/**
 * GET /api/merchants/:id/pricing
 * Get pricing for a specific merchant
 */
router.get('/merchants/:id/pricing', (req, res) => {
  const { id } = req.params;
  
  if (!merchantPricing[id]) {
    // Return default pricing if not set
    return res.json({
      mdr: "2.50",
      fixedFee: "0.30",
      currencies: ["AED"],
      effectiveStartDate: new Date()
    });
  }
  
  res.json(merchantPricing[id]);
});

/**
 * PUT /api/merchants/:id/pricing
 * Update pricing for a specific merchant
 */
router.put('/merchants/:id/pricing', (req, res) => {
  const { id } = req.params;
  const { mdr, fixedFee, currencies, effectiveStartDate } = req.body;
  
  // Validate required fields
  if (!mdr || !fixedFee || !currencies || !currencies.length) {
    return res.status(400).json({ 
      error: "Missing required pricing fields" 
    });
  }
  
  // Store the pricing data
  merchantPricing[id] = {
    mdr,
    fixedFee,
    currencies,
    effectiveStartDate: effectiveStartDate || new Date()
  };
  
  res.json({ 
    success: true, 
    message: "Pricing updated successfully",
    pricing: merchantPricing[id]
  });
});

// In-memory device assignment storage
let merchantDevices = {};
let assignedDeviceMap = {};

/**
 * GET /api/merchants/:id/devices
 * Get devices assigned to a specific merchant
 */
router.get('/merchants/:id/devices', (req, res) => {
  const { id } = req.params;
  
  if (!merchantDevices[id]) {
    return res.json({ devices: [] });
  }
  
  res.json({ devices: merchantDevices[id] });
});

/**
 * POST /api/merchants/:id/devices/assign
 * Assign a device to a merchant - supports both POS terminals and SoftPOS
 */
router.post('/merchants/:id/devices/assign', (req, res) => {
  const { id } = req.params;
  const { deviceId, deviceType } = req.body;
  
  if (!deviceId) {
    return res.status(400).json({ 
      error: "Device ID is required" 
    });
  }
  
  // Check if device is already assigned
  if (assignedDeviceMap[deviceId]) {
    return res.status(400).json({
      error: `Device is already assigned to merchant ${assignedDeviceMap[deviceId]}`
    });
  }
  
  let device;
  
  // Handle SoftPOS device (manually entered)
  if (deviceType === 'softpos') {
    // Create a new SoftPOS device entry
    device = {
      id: deviceId,
      serial: deviceId,
      status: "active",
      model: "SoftPOS Terminal",
      location: "",
      deviceType: "softpos",
      transactions: []
    };
  } else {
    // Find the device in the terminals list (hardware POS)
    device = global.terminals.find(t => t.id.toString() === deviceId.toString());
    
    if (!device) {
      return res.status(404).json({
        error: "Terminal not found"
      });
    }
    
    // Update device status for hardware POS
    device.status = "active";
  }
  
  // Initialize merchant devices array if it doesn't exist
  if (!merchantDevices[id]) {
    merchantDevices[id] = [];
  }
  
  // Assign the device
  merchantDevices[id].push(device);
  assignedDeviceMap[deviceId] = id;
  
  res.json({
    success: true,
    message: "Device assigned successfully",
    device
  });
});

/**
 * POST /api/merchants/:id/devices/remove
 * Remove a device from a merchant
 */
router.post('/merchants/:id/devices/remove', (req, res) => {
  const { id } = req.params;
  const { deviceId } = req.body;
  
  if (!deviceId) {
    return res.status(400).json({ 
      error: "Device ID is required" 
    });
  }
  
  // Check if merchant has any devices
  if (!merchantDevices[id] || !merchantDevices[id].length) {
    return res.status(404).json({
      error: "No devices found for this merchant"
    });
  }
  
  // Remove the device from the merchant
  merchantDevices[id] = merchantDevices[id].filter(device => 
    device.id !== deviceId
  );
  
  // Remove from assignment map
  delete assignedDeviceMap[deviceId];
  
  res.json({
    success: true,
    message: "Device removed successfully"
  });
});

module.exports = router;
