const userService = require('../services/userService');

class UserController {
  /**
   * Register new user
   * POST /api/node/users/register
   * Body: { "email": "user@example.com", "password": "password123" }
   */
  async register(req, res) {
    try {
      console.log('[Node] /api/users/register body:', req.body);
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Email and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Invalid email format'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Password must be at least 6 characters'
        });
      }

      const result = await userService.register(email, password);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      console.error('[Node] Register error:', error);
      if (error.message === 'ERR_EMAIL_EXISTS') {
        return res.status(409).json({
          error: 'ERR_EMAIL_EXISTS',
          message: 'Email already exists',
          debug: process.env.NODE_ENV !== 'production' ? String(error) : undefined
        });
      }
      res.status(500).json({
        error: 'ERR_REGISTRATION_FAILED',
        message: 'Registration failed',
        debug: process.env.NODE_ENV !== 'production' ? (error && error.message ? error.message : String(error)) : undefined
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/node/users/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const result = await userService.getProfile(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: 'ERR_GET_PROFILE_FAILED', message: 'Get profile failed' });
    }
  }

  /**
   * Update current user profile
   * PUT /api/node/users/profile
   * Body: { user_name?, user_phone?, user_address? }
   */
  async updateProfile(req, res) {
    try {
      console.log('[Node] /api/users/profile PUT body:', req.body);
      const userId = req.user.userId;
      const { user_name, user_phone, user_address } = req.body;

      const result = await userService.updateProfile(userId, { user_name, user_phone, user_address });
      res.json({ success: true, message: 'Profile updated successfully', data: result });
    } catch (error) {
      console.error('[Node] Update profile error:', error);
      res.status(500).json({ error: 'ERR_UPDATE_PROFILE_FAILED', message: 'Update profile failed', debug: String(error) });
    }
  }
  /**
   * Login user
   * POST /api/node/users/login
   * Body: { "email": "user@example.com", "password": "password123" }
   */
  async login(req, res) {
    try {
      console.log('[Node] /api/users/login body:', req.body);
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Email and password are required'
        });
      }

      const result = await userService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('[Node] Login error:', error);
      if (error.message === 'ERR_INVALID_CREDENTIALS') {
        return res.status(401).json({
          error: 'ERR_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          debug: process.env.NODE_ENV !== 'production' ? String(error) : undefined
        });
      }
      res.status(500).json({
        error: 'ERR_LOGIN_FAILED',
        message: 'Login failed',
        debug: process.env.NODE_ENV !== 'production' ? (error && error.message ? error.message : String(error)) : undefined
      });
    }
  }

  /**
   * Change password (requires authentication)
   * PUT /api/node/users/change-password
   * Headers: Authorization: Bearer {token}
   * Body: { "currentPassword": "old123", "newPassword": "new123" }
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId; // From auth middleware

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Current password and new password are required'
        });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'New password must be at least 6 characters'
        });
      }

      const result = await userService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: result
      });
    } catch (error) {
      if (error.message === 'ERR_INVALID_CURRENT_PASSWORD') {
        return res.status(400).json({
          error: 'ERR_INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        });
      }
      res.status(500).json({
        error: 'ERR_PASSWORD_CHANGE_FAILED',
        message: 'Password change failed'
      });
    }
  }

  /**
   * Forgot password - request reset token
   * POST /api/node/users/forgot-password
   * Body: { "email": "user@example.com" }
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Email is required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Invalid email format'
        });
      }

      const result = await userService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (error) {
      console.error('[Node] Forgot password error:', error);
      if (error.message === 'ERR_USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'ERR_USER_NOT_FOUND',
          message: 'No user found with this email address'
        });
      }
      res.status(500).json({
        error: 'ERR_FORGOT_PASSWORD_FAILED',
        message: 'Failed to process password reset request'
      });
    }
  }

  /**
   * Reset password with token
   * POST /api/node/users/reset-password
   * Body: { "token": "abc123...", "newPassword": "newpass123" }
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Validate required fields
      if (!token || !newPassword) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Token and new password are required'
        });
      }

      // Validate password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Password must be at least 6 characters'
        });
      }

      const result = await userService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (error) {
      console.error('[Node] Reset password error:', error);
      if (error.message === 'ERR_INVALID_OR_EXPIRED_TOKEN') {
        return res.status(400).json({
          error: 'ERR_INVALID_OR_EXPIRED_TOKEN',
          message: 'Invalid or expired reset token. Please request a new one.'
        });
      }
      res.status(500).json({
        error: 'ERR_RESET_PASSWORD_FAILED',
        message: 'Failed to reset password'
      });
    }
  }

  /**
   * Verify email with token
   * POST /api/node/users/verify-email
   * Body: { "token": "abc123..." }
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      // Validate required fields
      if (!token) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Verification token is required'
        });
      }

      const result = await userService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (error) {
      console.error('[Node] Verify email error:', error);
      if (error.message === 'ERR_INVALID_VERIFICATION_TOKEN') {
        return res.status(400).json({
          error: 'ERR_INVALID_VERIFICATION_TOKEN',
          message: 'Invalid verification token'
        });
      }
      res.status(500).json({
        error: 'ERR_VERIFY_EMAIL_FAILED',
        message: 'Failed to verify email'
      });
    }
  }

  /**
   * Resend verification email
   * POST /api/node/users/resend-verification
   * Body: { "email": "user@example.com" }
   */
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      // Validate required fields
      if (!email) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Email is required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'ERR_VALIDATION_FAILED',
          message: 'Invalid email format'
        });
      }

      const result = await userService.resendVerification(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (error) {
      console.error('[Node] Resend verification error:', error);
      if (error.message === 'ERR_USER_NOT_FOUND') {
        return res.status(404).json({
          error: 'ERR_USER_NOT_FOUND',
          message: 'No user found with this email address'
        });
      }
      if (error.message === 'ERR_EMAIL_ALREADY_VERIFIED') {
        return res.status(400).json({
          error: 'ERR_EMAIL_ALREADY_VERIFIED',
          message: 'Email is already verified'
        });
      }
      res.status(500).json({
        error: 'ERR_RESEND_VERIFICATION_FAILED',
        message: 'Failed to resend verification email'
      });
    }
  }
}

module.exports = new UserController();
