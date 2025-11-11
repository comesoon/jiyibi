const Transaction = require('../models/Transaction');
const xlsx = require('xlsx');

// @desc    Export transactions
// @route   GET /api/export
// @access  Private
const exportTransactions = async (req, res) => {
    try {
        const { format = 'csv', ledgerId, startDate, endDate } = req.query;

        const filter = { user: req.user._id };
        if (ledgerId) filter.ledger = ledgerId;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(filter)
            .populate('category', 'name')
            .populate('ledger', 'name currency')
            .lean(); // Use .lean() for faster queries when not modifying docs

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for the selected criteria.' });
        }

        const data = transactions.map(t => ({
            'Ledger': t.ledger.name,
            'Date': new Date(t.date).toLocaleDateString('en-CA'), // YYYY-MM-DD format
            'Description': t.description,
            'Category': t.category.name,
            'Type': t.type,
            'Amount': t.amount,
            'Currency': t.ledger.currency,
            'Created At': new Date(t.createdAt).toLocaleString(),
        }));

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        const fileName = `transactions-${Date.now()}`;

        if (format === 'xlsx') {
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            res.send(buffer);
        } else { // default to csv
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
            res.setHeader('Content-Type', 'text/csv');
            const csv = xlsx.utils.sheet_to_csv(worksheet);
            res.send(csv);
        }

    } catch (error) {
        res.status(500).json({ message: `Export failed: ${error.message}` });
    }
};

module.exports = {
    exportTransactions,
};
