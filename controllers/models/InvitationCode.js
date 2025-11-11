const mongoose = require('mongoose');

const InvitationCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    usesLeft: {
        type: Number,
        default: 1,
    },
    expiresAt: {
        type: Date,
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

module.exports = mongoose.model('InvitationCode', InvitationCodeSchema);
