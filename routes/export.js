const express = require('express');
const router = express.Router();
const { exportTransactions } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, exportTransactions);

module.exports = router;
