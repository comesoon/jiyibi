const express = require('express');
const router = express.Router();
const { 
    getLedgers, 
    getLedgerById, 
    createLedger, 
    updateLedger, 
    deleteLedger 
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getLedgers).post(protect, createLedger);
router.route('/:id').get(protect, getLedgerById).put(protect, updateLedger).delete(protect, deleteLedger);

module.exports = router;
