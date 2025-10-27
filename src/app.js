const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to ISP Management System API',
        version: '1.0.0',
        author: 'Oskar Pra Andrea Sussetyo',
        documentation: '/api/docs',
        health_check: '/api/health'
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                              ISP MANAGEMENT SYSTEM API                                                    ║
╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║  🚀 Server running on port: ${PORT}                                                                                          ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                                                                                      ║
║  📚 API Documentation: http://localhost:${PORT}/api/docs                                                                       ║
║  ❤️  Health Check: http://localhost:${PORT}/api/health                                                                          ║
║  📊 Database: MySQL (${process.env.DB_NAME || 'isp_management'})                                                                                ║
║                                                                                                                            ║
║  Features:                                                                                                                 ║
║  ✅ User Management & Role-based Access Control                                                                           ║
║  ✅ Customer Management                                                                                                    ║
║  ✅ Service Package & Subscription Management                                                                             ║
║  ✅ Ticket Management System                                                                                              ║
║  ✅ JWT Authentication                                                                                                     ║
║  ✅ Rate Limiting & Security Headers                                                                                      ║
║  ✅ Input Validation & Error Handling                                                                                     ║
║                                                                                                                               ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;