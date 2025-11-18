const adminUserService = require('../services/adminUserService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await adminUserService.login(email, password);
      
      return res.json({ success: true, message: 'Login successful', data: result });
    } catch (err) {
      if (err.message === 'ERR_INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS', message: 'Invalid email or password' });
      }
      // Log unexpected errors to help debugging
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AuthController.login] Unexpected error:', err && err.stack ? err.stack : err);
      }
      return res.status(500).json({ error: 'ERR_LOGIN_FAILED', message: 'Login failed' });
    }
  }

  async me(req, res) {
    try {
      const profile = await adminUserService.getProfile(req.admin.adminId);
      return res.json({ success: true, data: profile });
    } catch (err) {
      if (err.message === 'ERR_ADMIN_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_ADMIN_NOT_FOUND', message: 'Admin not found' });
      }
      return res.status(500).json({ error: 'ERR_GET_PROFILE_FAILED', message: 'Failed to get profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const updated = await adminUserService.updateProfile(req.admin.adminId, { name: req.body.name });
      return res.json({ success: true, message: 'Profile updated successfully', data: updated });
    } catch (err) {
      return res.status(500).json({ error: 'ERR_UPDATE_PROFILE_FAILED', message: 'Failed to update profile' });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await adminUserService.changePassword(req.admin.adminId, currentPassword, newPassword);
      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      if (err.message === 'ERR_INVALID_CURRENT_PASSWORD') {
        return res.status(400).json({ error: 'ERR_INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect' });
      }
      return res.status(500).json({ error: 'ERR_PASSWORD_CHANGE_FAILED', message: 'Failed to change password' });
    }
  }
}

module.exports = new AuthController();


