const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const apiSettingController = require('../controllers/apiSettingController');
const multer = require('multer');
const upload = multer({ dest: 'public/images/logo/' });

// Dashboard route
router.get('/', dashboardController.getDashboardData);

// Setting update route
router.post('/setting/update', upload.single('logo'), apiSettingController.updateSetting);

module.exports = router; 