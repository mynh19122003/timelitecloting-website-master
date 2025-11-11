const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { generateToken } = require('../config/jwt');

class AdminUserService {
  async login(email, password) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AdminUserService.login] Attempt login for', email);
    }
    const [rows] = await pool.execute(
      'SELECT id, admin_id, admin_email, admin_name, admin_password FROM admin WHERE admin_email = ? LIMIT 1',
      [email]
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AdminUserService.login] Query rows:', Array.isArray(rows) ? rows.length : typeof rows);
    }
    if (rows.length === 0) throw new Error('ERR_INVALID_CREDENTIALS');
    const admin = rows[0];

    let passwordMatches = false;
    const stored = admin.admin_password || '';
    const isHashed = typeof stored === 'string' && stored.startsWith('$2');
    if (isHashed) {
      passwordMatches = await bcrypt.compare(password, stored);
    } else {
      // Fallback for legacy plaintext passwords. If matches, upgrade to bcrypt immediately.
      passwordMatches = stored === password;
      if (passwordMatches) {
        const upgradedHash = await bcrypt.hash(password, 10);
        await pool.execute('UPDATE admin SET admin_password = ? WHERE id = ?', [upgradedHash, admin.id]);
      }
    }

    if (!passwordMatches) throw new Error('ERR_INVALID_CREDENTIALS');

    const role = 'super_admin';
    const token = generateToken({ adminId: admin.id, email: admin.admin_email, role });
    return {
      admin: {
        id: admin.id,
        admin_id: admin.admin_id,
        email: admin.admin_email,
        name: admin.admin_name,
        role
      },
      token
    };
  }

  async getProfile(adminId) {
    const [rows] = await pool.execute(
      'SELECT id, admin_id, admin_email, admin_name, create_date, update_date FROM admin WHERE id = ? LIMIT 1',
      [adminId]
    );
    if (rows.length === 0) throw new Error('ERR_ADMIN_NOT_FOUND');
    const a = rows[0];
    return {
      id: a.id,
      admin_id: a.admin_id,
      email: a.admin_email,
      name: a.admin_name,
      created_at: a.create_date,
      updated_at: a.update_date
    };
  }

  async updateProfile(adminId, { name }) {
    if (typeof name !== 'string' || name.trim() === '') return this.getProfile(adminId);
    await pool.execute('UPDATE admin SET admin_name = ? WHERE id = ?', [name, adminId]);
    return this.getProfile(adminId);
  }

  async changePassword(adminId, currentPassword, newPassword) {
    const [rows] = await pool.execute('SELECT id, admin_password FROM admin WHERE id = ? LIMIT 1', [adminId]);
    if (rows.length === 0) throw new Error('ERR_ADMIN_NOT_FOUND');
    const admin = rows[0];

    const stored = admin.admin_password || '';
    const isHashed = typeof stored === 'string' && stored.startsWith('$2');
    let ok = false;
    if (isHashed) ok = await bcrypt.compare(currentPassword, stored);
    else ok = stored === currentPassword;

    if (!ok) throw new Error('ERR_INVALID_CURRENT_PASSWORD');

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE admin SET admin_password = ? WHERE id = ?', [hash, adminId]);
    return { message: 'Password changed successfully' };
  }
}

module.exports = new AdminUserService();


