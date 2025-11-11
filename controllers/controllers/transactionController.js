const Transaction = require('../models/Transaction');
const Ledger = require('../models/Ledger');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { ledgerId, categoryId, startDate, endDate, type, description } = req.query;
        const filter = { user: req.user._id };

        if (ledgerId) {
            filter.ledger = ledgerId;
        }
        if (categoryId) {
            filter.category = categoryId;
        }
        if (type) {
            filter.type = type;
        }
        if (description) {
            filter.description = { $regex: description, $options: 'i' };
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.date.$lte = new Date(endDate);
            }
        }

        const transactions = await Transaction.find(filter)
            .populate('category', 'name type')
            .populate('ledger', 'name currency')
            .sort({ date: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('category ledger');

        if (transaction && transaction.user.toString() === req.user._id.toString()) {
            res.json(transaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    const { ledger, category, date, description, amount, type } = req.body;

    try {
        // Verify the ledger belongs to the user
        const ledgerExists = await Ledger.findOne({ _id: ledger, user: req.user._id });
        if (!ledgerExists) {
            return res.status(404).json({ message: 'Ledger not found for this user.' });
        }

        const transaction = new Transaction({
            user: req.user._id,
            ledger,
            category,
            date,
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type,
        });

        const createdTransaction = await transaction.save();
        res.status(201).json(createdTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (transaction && transaction.user.toString() === req.user._id.toString()) {
            const { ledger, category, date, description, amount, type } = req.body;

            transaction.ledger = ledger || transaction.ledger;
            transaction.category = category || transaction.category;
            transaction.date = date || transaction.date;
            transaction.description = description || transaction.description;
            transaction.type = type || transaction.type;
            
            if (amount) {
                 transaction.amount = transaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
            }

            const updatedTransaction = await transaction.save();
            res.json(updatedTransaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (transaction && transaction.user.toString() === req.user._id.toString()) {
            await transaction.deleteOne();
            res.json({ message: 'Transaction removed' });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
