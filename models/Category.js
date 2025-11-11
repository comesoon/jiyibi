const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Null user means it's a default category
        default: null
    },
    name: {
        type: String,
        required: true
    },
    // 'income' or 'expense'
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    }
});

// Ensure that for a specific user, the category name is unique
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
