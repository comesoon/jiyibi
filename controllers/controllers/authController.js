const User = require('../models/User');
const InvitationCode = require('../models/InvitationCode');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password, invitationCode } = req.body;

    try {
        // 1. Validate Invitation Code
        if (!invitationCode) {
            return res.status(400).json({ message: 'Invitation code is required' });
        }

        const code = await InvitationCode.findOne({ code: invitationCode });

        if (!code) {
            return res.status(400).json({ message: 'Invalid invitation code' });
        }
        if (code.usesLeft <= 0) {
            return res.status(400).json({ message: 'Invitation code has no uses left' });
        }
        if (code.expiresAt && code.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invitation code has expired' });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create user
        const user = await User.create({
            email,
            password,
        });

        if (user) {
            // 4. Invalidate the invitation code
            code.usesLeft -= 1;
            code.usedBy.push(user._id);
            await code.save();

            res.status(201).json({
                _id: user._id,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
                            res.json({
                                _id: user._id,
                                email: user.email,
                                nickname: user.nickname,
                                role: user.role, // Add this line
                                token: generateToken(user._id),
                            });        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
