const Category = require('../models/Category');

// @desc    Get all categories (default and user-specific)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const defaultCategories = await Category.find({ user: null });
        const userCategories = await Category.find({ user: req.user._id });
        res.json([...defaultCategories, ...userCategories]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
    }

    try {
        const category = new Category({
            user: req.user._id,
            name,
            type,
        });

        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category with this name already exists for this user.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    const { name, type } = req.body;

    try {
        const category = await Category.findById(req.params.id);

        // Check if the category belongs to the user and is not a default one
        if (category && category.user && category.user.toString() === req.user._id.toString()) {
            category.name = name || category.name;
            category.type = type || category.type;

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found or you do not have permission to edit it' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        // Check if the category belongs to the user and is not a default one
        if (category && category.user && category.user.toString() === req.user._id.toString()) {
            // In a real app, you should check if this category is used by any transactions.
            // If so, you might want to prevent deletion or re-assign transactions to a default category.
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found or you do not have permission to delete it' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed default categories
// @route   POST /api/categories/seed
// @access  Public (or Admin only in a real app)
const seedDefaultCategories = async (req, res) => {
    const defaultCategories = [
        // Income
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Investment', type: 'income' },
        // Expense
        { name: 'Food', type: 'expense' },
        { name: 'Transport', type: 'expense' },
        { name: 'Housing', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Health', type: 'expense' },
        { name: 'Other', type: 'expense' },
    ];

    try {
        // Remove existing default categories to avoid duplicates
        await Category.deleteMany({ user: null });
        await Category.insertMany(defaultCategories);
        res.status(201).json({ message: 'Default categories seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,
};
