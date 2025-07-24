const express = require('express');
const router = express.Router();
const merchantsController = require('../controllers/merchantsController');

// Bulk account creation (admin)
router.post('/bulk', merchantsController.bulkCreate);
// Template-based setup
router.get('/templates', merchantsController.getTemplates);
router.post('/templates', merchantsController.createTemplate);
// Self-service registration
router.post('/register', merchantsController.register);
// Profile updates
router.put('/:id/profile', merchantsController.updateProfile);
// Profile transitions
router.post('/:id/upgrade', merchantsController.upgrade);
router.post('/:id/downgrade', merchantsController.downgrade);
router.post('/:id/transfer', merchantsController.transferOwnership);
router.post('/:id/location', merchantsController.addLocation);
// Account closure/archival
router.post('/:id/close', merchantsController.closeAccount);
// Custom config
router.put('/:id/config', merchantsController.updateConfig);
// Automated review
router.get('/:id/review', merchantsController.reviewAccount);
// Get merchant profile
router.get('/:id', merchantsController.getProfile);
// List all merchants
router.get('/', merchantsController.list);

module.exports = router;
