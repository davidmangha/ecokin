const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../server/middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, dashboardController.stats);

module.exports = router;
