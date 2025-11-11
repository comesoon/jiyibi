const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Ledger name is required'],
        minlength: 2,
        maxlength: 20
    },
    description: {
        type: String,
        maxlength: 50
    },
    currency: {
        type: String,
        required: true,
        default: 'CNY'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ledger', LedgerSchema);
