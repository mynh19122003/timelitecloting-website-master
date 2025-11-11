const usersService = require('../services/usersService');

class UsersController {
  async listGet(req, res) {
    try {
      const { page = 1, limit = 10, q = '' } = req.query || {};
      const result = await usersService.listCustomers(parseInt(page), parseInt(limit), q);
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ error: 'ERR_GET_USERS_FAILED', message: 'Failed to get customers' });
    }
  }

  async list(req, res) {
    try {
      const { page = 1, limit = 10, q = '' } = req.body || {};
      const result = await usersService.listCustomers(parseInt(page), parseInt(limit), q);
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ error: 'ERR_GET_USERS_FAILED', message: 'Failed to get customers' });
    }
  }

  async getByParam(req, res) {
    try {
      const { id } = req.params; // can be numeric id, user_code (UID00001), or email
      const user = await usersService.getCustomer(id);
      return res.json({ success: true, data: user });
    } catch (err) {
      if (err.message === 'ERR_USER_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_USER_NOT_FOUND', message: 'User not found' });
      }
      return res.status(500).json({ error: 'ERR_GET_USER_FAILED', message: 'Failed to get user' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await usersService.updateCustomer(id, req.body || {});
      return res.json({ success: true, message: 'Customer updated successfully', data: updated });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'ERR_EMAIL_EXISTS', message: 'Email already exists' });
      }
      if (err.message === 'ERR_USER_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_USER_NOT_FOUND', message: 'User not found' });
      }
      return res.status(500).json({ error: 'ERR_UPDATE_USER_FAILED', message: 'Failed to update user' });
    }
  }
}

module.exports = new UsersController();


