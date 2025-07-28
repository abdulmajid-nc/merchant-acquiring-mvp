const express = require('express');
const router = express.Router();
const mccsController = require('../controllers/mccsController');

// GET all MCCs
router.get('/', mccsController.getAllMccs);

// GET MCC by code
router.get('/:code', mccsController.getMccByCode);

// POST create new MCC
router.post('/', mccsController.createMcc);

// PUT update MCC
router.put('/:code', mccsController.updateMcc);

// DELETE MCC
router.delete('/:code', mccsController.deleteMcc);

module.exports = router;
