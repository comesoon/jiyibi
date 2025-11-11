const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/ISACC
const getAllUsers = async (req, res) => {
    try {
        // Find all users but exclude their passwords from the result
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/ISACC
const updateUserRole = async (req, res) => {
    const { role } = req.body;

    // Basic validation for the role
    if (!['user', 'isacc'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        // Return the updated user without the password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
};
