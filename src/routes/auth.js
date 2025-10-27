const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.post('/login', AuthController.validateLogin, validate, AuthController.login);
router.post('/register', AuthController.validateRegister, validate, AuthController.register);

// Protected routes
router.get('/me', authMiddleware, AuthController.me);
router.post('/change-password', 
    authMiddleware, 
    AuthController.validateChangePassword, 
    validate, 
    AuthController.changePassword
);

module.exports = router;