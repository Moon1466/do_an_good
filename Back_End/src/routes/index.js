const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard route
router.get('/', dashboardController.getDashboardData);

module.exports = router; 