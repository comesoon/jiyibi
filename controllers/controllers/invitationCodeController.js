const InvitationCode = require('../models/InvitationCode');
const crypto = require('crypto');

// @desc    Get invitation codes for the current user
// @route   GET /api/invitation-codes
// @access  Private
const getInvitationCodes = async (req, res) => {
    try {
        const codes = await InvitationCode.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json(codes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new invitation code
// @route   POST /api/invitation-codes
// @access  Private
const createInvitationCode = async (req, res) => {
    const { usesLeft, expiresAt } = req.body;

    try {
        // Generate a more readable, unique code
        const codeString = `INVITE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const newCode = await InvitationCode.create({
            code: codeString,
            createdBy: req.user.id,
            usesLeft: usesLeft || 1, // Default to 1 use if not specified
            expiresAt: expiresAt || null,
        });

        res.status(201).json(newCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInvitationCodes,
    createInvitationCode,
};
