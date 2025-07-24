const express = require('express');
const router = express.Router();
const terminalsController = require('../controllers/terminalsController');

// Terminal onboarding
router.post('/onboard', terminalsController.onboard);
// Terminal config update
router.put('/:id/config', terminalsController.updateConfig);
// Transaction history
router.get('/:id/transactions', terminalsController.getTransactions);
// Void transaction
router.post('/:id/void', terminalsController.voidTransaction);
// Terminal lifecycle
router.post('/:id/replace', terminalsController.replaceTerminal);
router.post('/:id/retire', terminalsController.retireTerminal);
router.post('/:id/terminate', terminalsController.terminateTerminal);
// List all terminals
router.get('/', terminalsController.list);

module.exports = router;
