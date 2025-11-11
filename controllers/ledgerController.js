const Ledger = require('../models/Ledger');
const Transaction = require('../models/Transaction');

// @desc    Get all ledgers for a user
// @route   GET /api/ledgers
// @access  Private
const getLedgers = async (req, res) => {
    try {
        const ledgers = await Ledger.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(ledgers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single ledger by ID
// @route   GET /api/ledgers/:id
// @access  Private
const getLedgerById = async (req, res) => {
    try {
        const ledger = await Ledger.findById(req.params.id);

        if (ledger && ledger.user.toString() === req.user._id.toString()) {
            res.json(ledger);
        } else {
            res.status(404).json({ message: 'Ledger not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new ledger
// @route   POST /api/ledgers
// @access  Private
const createLedger = async (req, res) => {
    const { name, description, currency } = req.body;

    try {
        const ledger = new Ledger({
            user: req.user._id,
            name,
            description,
            currency,
        });

        const createdLedger = await ledger.save();
        res.status(201).json(createdLedger);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a ledger
// @route   PUT /api/ledgers/:id
// @access  Private
const updateLedger = async (req, res) => {
    const { name, description, currency } = req.body;

    try {
        const ledger = await Ledger.findById(req.params.id);

        if (ledger && ledger.user.toString() === req.user._id.toString()) {
            ledger.name = name || ledger.name;
            ledger.description = description || ledger.description;
            ledger.currency = currency || ledger.currency;

            const updatedLedger = await ledger.save();
            res.json(updatedLedger);
        } else {
            res.status(404).json({ message: 'Ledger not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a ledger
// @route   DELETE /api/ledgers/:id
// @access  Private
const deleteLedger = async (req, res) => {
    try {
        const ledger = await Ledger.findById(req.params.id);

        if (ledger && ledger.user.toString() === req.user._id.toString()) {
            // Also delete all transactions associated with this ledger
            await Transaction.deleteMany({ ledger: req.params.id, user: req.user._id });
            
            await ledger.deleteOne();
            res.json({ message: 'Ledger and associated transactions removed' });
        } else {
            res.status(404).json({ message: 'Ledger not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLedgers,
    getLedgerById,
    createLedger,
    updateLedger,
    deleteLedger,
};
