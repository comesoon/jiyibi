const express = require('express');
const router = express.Router();
const { getInvitationCodes, createInvitationCode } = require('../controllers/invitationCodeController');
const { protect } = require('../middleware/auth');
const { isacc } = require('../middleware/isacc');

router.route('/')
    .get(protect, isacc, getInvitationCodes)
    .post(protect, isacc, createInvitationCode);

module.exports = router;
