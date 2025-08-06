/**
 * Tranlog Routes
 * 
 * API routes for accessing transaction logs data
 */

const express = require('express');
const tranlogsController = require('../controllers/tranlogsController');

const router = express.Router();

/**
 * @route   GET /api/tranlogs
 * @desc    Get paginated list of transaction logs
 * @access  Private
 */
router.get('/', tranlogsController.getTranlogs);

/**
 * @route   GET /api/tranlogs/stats
 * @desc    Get transaction statistics for dashboard
 * @access  Private
 */
router.get('/stats', tranlogsController.getTranlogStats);

/**
 * @route   GET /api/tranlogs/:id
 * @desc    Get transaction log by ID
 * @access  Private
 */
router.get('/:id', tranlogsController.getTranlogById);

/**
 * @route   POST /api/tranlogs/import
 * @desc    Import transaction logs from CSV
 * @access  Private
 */
router.post('/import', tranlogsController.importTranlogs);

module.exports = router;
