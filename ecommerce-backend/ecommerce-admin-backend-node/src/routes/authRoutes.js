const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, loginSchema, changePasswordSchema, updateProfileSchema } = require('../middleware/validation');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticateToken, authController.me);
router.put('/password', authenticateToken, validate(changePasswordSchema), authController.changePassword);
router.put('/profile', authenticateToken, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;


