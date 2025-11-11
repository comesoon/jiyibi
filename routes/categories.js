const express = require('express');
const router = express.Router();
const { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    seedDefaultCategories 
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

// This route can be used to populate the default categories
router.post('/seed', seedDefaultCategories);

router.route('/').get(protect, getCategories).post(protect, createCategory);
router.route('/:id').put(protect, updateCategory).delete(protect, deleteCategory);

module.exports = router;
