require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();

// --- Middleware ---
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "cdn.jsdelivr.net"],
            },
        },
    })
);
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Serve Frontend Static Files ---
app.use(express.static('dist'));

// --- API Rate Limiter ---
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter);


// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
        
        // 自动填充默认分类
        await seedDefaultCategoriesIfEmpty();
    } catch (err) {
        console.error(err.message);
        // process.exit(1); // Commented out to allow for more resilient connection attempts
    }
};

// Import category controller for seeding default categories
const { seedDefaultCategories } = require('./controllers/categoryController');

// Function to seed default categories if the collection is empty
const seedDefaultCategoriesIfEmpty = async () => {
    try {
        const Category = require('./models/Category');
        const count = await Category.countDocuments({ user: null });
        
        if (count === 0) {
            console.log('Seeding default categories...');
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
            
            await Category.insertMany(defaultCategories);
            console.log('Default categories seeded successfully');
        } else {
            console.log('Default categories already exist, skipping seeding');
        }
    } catch (error) {
        console.error('Error seeding default categories:', error.message);
    }
};

// Add a delay before attempting to connect to MongoDB
console.log('Waiting for MongoDB to be ready...');
setTimeout(() => {
    connectDB();
}, 5000); // Wait for 5 seconds

// --- API Routes ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ledgerRoutes = require('./routes/ledgers');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const exportRoutes = require('./routes/export');
const invitationCodeRoutes = require('./routes/invitationCodes');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/invitation-codes', invitationCodeRoutes);
app.use('/api/admin', adminRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Frontend Catch-all Route ---
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));