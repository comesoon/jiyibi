// Middleware to check for 'isacc' role
const isacc = (req, res, next) => {
    if (req.user && req.user.role === 'isacc') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Administrator access required' });
    }
};

module.exports = { isacc };
