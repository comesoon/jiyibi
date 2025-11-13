const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true,
        maxlength: 50
    },
    // Stored as a negative number for expense, positive for income
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add a compound index for frequent queries to improve performance
TransactionSchema.index({ user: 1, ledger: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
