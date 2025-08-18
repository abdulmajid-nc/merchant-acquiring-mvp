/**
 * Fee Routes
 * API endpoints for fee structure management
 */

const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

// GET /api/fees - Get all fee structures 
router.get('/', feeController.getAllFeeStructures.bind(feeController));

// POST /api/fees - Create a new fee structure
router.post('/', feeController.createFeeStructure.bind(feeController));

// POST /api/fees/calculate - Calculate fees for a transaction
router.post('/calculate', feeController.calculateFees.bind(feeController));

// POST /api/fees/assign - Assign a fee structure to a merchant
router.post('/assign', feeController.assignFeeStructureToMerchant.bind(feeController));

// PUT /api/fees/:id - Update a fee structure
router.put('/:id', feeController.updateFeeStructure.bind(feeController));

// DELETE /api/fees/:id - Delete a fee structure
router.delete('/:id', feeController.deleteFeeStructure.bind(feeController));

// GET /api/fees/:id/volume-tiers - Get volume tiers for a fee structure
router.get('/:id/volume-tiers', feeController.getVolumeTiersForFeeStructure.bind(feeController));

// POST /api/fees/volume-tiers - Create a new volume tier
router.post('/volume-tiers', feeController.createVolumeTier.bind(feeController));

// PUT /api/fees/volume-tiers/:id - Update a volume tier
router.put('/volume-tiers/:id', feeController.updateVolumeTier.bind(feeController));

// DELETE /api/fees/volume-tiers/:id - Delete a volume tier
router.delete('/volume-tiers/:id', feeController.deleteVolumeTier.bind(feeController));

// GET /api/fees/:id - Get a fee structure by ID (must be last to avoid conflicts with specific routes)
router.get('/:id', feeController.getFeeStructureById.bind(feeController));

module.exports = router;
