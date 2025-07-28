const express = require('express');
const router = express.Router();
const terminalsController = require('../controllers/terminalsController');

/**
 * @api {get} /api/terminals Get all terminals
 * @apiName GetAllTerminals
 * @apiGroup Terminals
 * @apiQuery {Boolean} available If true, returns only unassigned terminals
 */
router.get('/', (req, res) => {
  // Check for available filter (show only available/unassigned terminals)
  const showOnlyAvailable = req.query.available === 'true';
  
  // Use the existing controller, but add the filter capability
  if (showOnlyAvailable) {
    // Override to show only available terminals
    req.query = { ...req.query, filter: 'available' };
  }
  
  // Call the original handler
  terminalsController.list(req, res);
});

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

module.exports = router;
