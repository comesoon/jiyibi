# Jiyibi APP

[中文版](README.zh.md)

A web-based bookkeeping application for personal and small team financial management. This application provides an efficient and convenient way to record, manage, and analyze financial transactions with multi-language support and responsive design.

## Features

- **Multi-language Support**: Supports both Chinese and English interfaces with real-time switching
- **Responsive Design**: Adapts to PC, tablet, and mobile devices with optimized layouts
- **User Authentication**: Secure login and registration system with JWT-based authentication
- **Ledger Management**: Create and manage multiple ledgers with custom descriptions and currencies
- **Transaction Management**: Record, edit, and categorize financial transactions with date, description, category, and amount
- **Data Visualization**: Charts and graphs to visualize spending patterns and financial trends
- **Data Export**: Export ledger data in Excel (XLSX) and CSV formats
- **Offline Storage**: Local data storage with synchronization when online
- **Category Management**: Customizable income and expense categories
- **Security**: Password encryption, HTTPS data transmission, and role-based access control

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML, CSS, JavaScript
- **Security**: Helmet, CORS, JWT
- **Other**: Bcrypt for password hashing, XLSX for export functionality

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/comesoon/jiyibi.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=your_frontend_url
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

## API Routes

- `/api/auth` - Authentication (login, register, password reset)
- `/api/users` - User management
- `/api/ledgers` - Ledger operations
- `/api/categories` - Category management
- `/api/transactions` - Transaction operations
- `/api/export` - Data export functionality
- `/api/invitation-codes` - Invitation code management
- `/api/admin` - Administrative functions

## Project Structure

```
jiyibi-app/
├── controllers/          # Request handlers
├── middleware/           # Authentication and validation middleware
├── models/               # Database models
├── public/               # Frontend files (HTML, CSS, JS)
├── routes/               # API route definitions
├── server.js             # Main server file
└── package.json
```

## Frontend Components

The frontend is located in the `public/` directory and includes:

- `index.html` - Main application page
- `css/main.css` - Styling
- `js/` - JavaScript files for functionality including:
  - `api.js` - API communication
  - `auth.js` - Authentication logic
  - `chart.js` - Chart generation
  - `components.js` - UI components
  - `main.js` - Main application logic
  - `store.js` - Data storage and management
  - `sync.js` - Offline sync functionality
  - `toast.js` - Notification system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/comesoon/jiyibi?tab=MIT-1-ov-file) file for details.

## Acknowledgments

- Built with Express.js and MongoDB
- Uses various open-source libraries for enhanced functionality
- Inspired by the need for simple and effective personal financial management tools