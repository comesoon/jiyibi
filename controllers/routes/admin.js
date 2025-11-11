const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isacc } = require('../middleware/isacc');

// All routes in this file are protected and require admin access
router.use(protect, isacc);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
