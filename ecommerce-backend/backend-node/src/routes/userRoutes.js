const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, changePasswordSchema } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Password reset routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Email verification routes
router.post('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerification);

// Protected routes
router.put('/change-password', authenticateToken, validate(changePasswordSchema), userController.changePassword);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

module.exports = router;
