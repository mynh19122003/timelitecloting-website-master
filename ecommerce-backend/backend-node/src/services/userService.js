const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { generateToken } = require('../config/jwt');
const crypto = require('crypto');

// Helper function to generate random token
function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

class UserService {
  /**
   * Register new user
   * Auto-generates user_code in format UID00001, UID00002, etc.
   */
  async register(email, password) {
    try {
      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new Error('ERR_EMAIL_EXISTS');
      }

      // Hash password with bcrypt (cost factor 10)
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert user
      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash]
      );

      const userId = result.insertId;

      // Generate and set user_code: UID00001, UID00002, ...
      const userCode = 'UID' + String(userId).padStart(5, '0');
      await pool.execute(
        'UPDATE users SET user_code = ? WHERE id = ?',
        [userCode, userId]
      );

      // Get user with generated user_code
      const [users] = await pool.execute(
        'SELECT id, user_code, email, created_at FROM users WHERE id = ?',
        [userId]
      );

      const user = users[0];

      // Generate JWT token (8 hours expiration)
      const token = generateToken({
        userId: user.id,
        userCode: user.user_code,
        email: user.email
      });

      return {
        user: {
          id: user.id,
          user_code: user.user_code,
          email: user.email,
          created_at: user.created_at
        },
        token
      };
    } catch (error) {
      console.error('[Node][UserService.register] Error:', error);
      if (error && (error.message === 'ERR_EMAIL_EXISTS' || error.code === 'ER_DUP_ENTRY')) {
        throw new Error('ERR_EMAIL_EXISTS');
      }
      throw new Error('ERR_REGISTRATION_FAILED');
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user by email
      const [users] = await pool.execute(
        'SELECT id, user_code, email, password_hash, created_at FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('ERR_INVALID_CREDENTIALS');
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('ERR_INVALID_CREDENTIALS');
      }

      // Generate JWT token (8 hours expiration)
      const token = generateToken({
        userId: user.id,
        userCode: user.user_code,
        email: user.email
      });

      return {
        user: {
          id: user.id,
          user_code: user.user_code,
          email: user.email,
          created_at: user.created_at
        },
        token
      };
    } catch (error) {
      if (error.message === 'ERR_INVALID_CREDENTIALS') {
        throw error;
      }
      throw new Error('ERR_LOGIN_FAILED');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user with password
      const [users] = await pool.execute(
        'SELECT id, email, password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('ERR_USER_NOT_FOUND');
      }

      const user = users[0];

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('ERR_INVALID_CURRENT_PASSWORD');
      }

      // Hash new password with bcrypt (cost factor 10)
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newPasswordHash, userId]
      );

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error.message === 'ERR_INVALID_CURRENT_PASSWORD' || error.message === 'ERR_USER_NOT_FOUND') {
        throw error;
      }
      throw new Error('ERR_PASSWORD_CHANGE_FAILED');
    }
  }

  async getProfile(userId) {
    const [rows] = await pool.execute(
      'SELECT id, user_code, email, user_name, user_phone, user_address, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) throw new Error('ERR_USER_NOT_FOUND');
    return rows[0];
  }

  async updateProfile(userId, { user_name, user_phone, user_address }) {
    // Build dynamic update
    const fields = [];
    const params = [];
    if (typeof user_name === 'string') { fields.push('user_name = ?'); params.push(user_name); }
    if (typeof user_phone === 'string') { fields.push('user_phone = ?'); params.push(user_phone); }
    if (typeof user_address === 'string') { fields.push('user_address = ?'); params.push(user_address); }
    if (fields.length === 0) return await this.getProfile(userId);

    params.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(sql, params);
    return await this.getProfile(userId);
  }

  // Issue password reset token (valid 1h). For demo, return token in response
  async requestPasswordReset(email) {
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return { issued: true }; // do not leak user existence
    const userId = users[0].id;
    const token = crypto.randomBytes(24).toString('hex');
    const [res] = await pool.execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [userId, token]
    );
    return { token, expires_in: 3600 };
  }

  async resetPassword(token, newPassword) {
    const [rows] = await pool.execute(
      'SELECT pr.user_id FROM password_resets pr WHERE pr.token = ? AND pr.expires_at > NOW() LIMIT 1',
      [token]
    );
    if (rows.length === 0) throw new Error('Invalid or expired token');
    const userId = rows[0].user_id;
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [userId]);
    return { success: true };
  }

  async requestEmailVerification(email) {
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return { issued: true };
    const userId = users[0].id;
    const token = crypto.randomBytes(24).toString('hex');
    await pool.execute(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [userId, token]
    );
    return { token, expires_in: 86400 };
  }

  /**
   * Request password reset - generates token and logs it to console
   */
  async forgotPassword(email) {
    try {
      // Check if user exists
      const [users] = await pool.execute(
        'SELECT id, email FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('ERR_USER_NOT_FOUND');
      }

      const user = users[0];

      // Generate reset token (valid for 15 minutes)
      const resetToken = generateRandomToken();
      const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Save token to database
      await pool.execute(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, expiryDate, user.id]
      );

      // 🔍 LOG TOKEN TO CONSOLE (since no email service)
      console.log('\n=== PASSWORD RESET TOKEN ===');
      // Get frontend URL from environment variable, default to localhost for development
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl.replace(/\/+$/, '')}/reset-password?token=${resetToken}`;

      console.log(`Email: ${email}`);
      console.log(`Token: ${resetToken}`);
      console.log(`Expires at: ${expiryDate.toISOString()}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('============================\n');

      return {
        success: true,
        message: 'Password reset token generated. Check console logs for token.',
        email: user.email
      };
    } catch (error) {
      console.error('[Node][UserService.forgotPassword] Error:', error);
      if (error.message === 'ERR_USER_NOT_FOUND') {
        throw error;
      }
      throw new Error('ERR_FORGOT_PASSWORD_FAILED');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    try {
      // Find user with valid token
      const [users] = await pool.execute(
        'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
        [token]
      );

      if (users.length === 0) {
        throw new Error('ERR_INVALID_OR_EXPIRED_TOKEN');
      }

      const user = users[0];

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await pool.execute(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [passwordHash, user.id]
      );

      console.log(`\n✅ Password reset successful for user: ${user.email}\n`);

      return {
        success: true,
        message: 'Password has been reset successfully.',
        email: user.email
      };
    } catch (error) {
      console.error('[Node][UserService.resetPassword] Error:', error);
      if (error.message === 'ERR_INVALID_OR_EXPIRED_TOKEN') {
        throw error;
      }
      throw new Error('ERR_RESET_PASSWORD_FAILED');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    try {
      // Find user with valid verification token
      const [users] = await pool.execute(
        'SELECT id, email FROM users WHERE verification_token = ?',
        [token]
      );

      if (users.length === 0) {
        throw new Error('ERR_INVALID_VERIFICATION_TOKEN');
      }

      const user = users[0];

      // Mark email as verified and clear token
      await pool.execute(
        'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
        [user.id]
      );

      console.log(`\n✅ Email verified successfully for user: ${user.email}\n`);

      return {
        success: true,
        message: 'Email has been verified successfully.',
        email: user.email
      };
    } catch (error) {
      console.error('[Node][UserService.verifyEmail] Error:', error);
      if (error.message === 'ERR_INVALID_VERIFICATION_TOKEN') {
        throw error;
      }
      throw new Error('ERR_VERIFY_EMAIL_FAILED');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    try {
      // Check if user exists
      const [users] = await pool.execute(
        'SELECT id, email, email_verified FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('ERR_USER_NOT_FOUND');
      }

      const user = users[0];

      // Check if already verified
      if (user.email_verified === 1) {
        throw new Error('ERR_EMAIL_ALREADY_VERIFIED');
      }

      // Generate new verification token
      const verificationToken = generateRandomToken();

      // Save token to database
      await pool.execute(
        'UPDATE users SET verification_token = ? WHERE id = ?',
        [verificationToken, user.id]
      );

      // Get frontend URL from environment variable, default to localhost for development
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verifyUrl = `${frontendUrl.replace(/\/+$/, '')}/verify-email?token=${verificationToken}`;

      // 🔍 LOG TOKEN TO CONSOLE (since no email service)
      console.log('\n=== EMAIL VERIFICATION TOKEN ===');
      console.log(`Email: ${email}`);
      console.log(`Token: ${verificationToken}`);
      console.log(`Verify URL: ${verifyUrl}`);
      console.log('================================\n');

      return {
        success: true,
        message: 'Verification token generated. Check console logs for token.',
        email: user.email
      };
    } catch (error) {
      console.error('[Node][UserService.resendVerification] Error:', error);
      if (error.message === 'ERR_USER_NOT_FOUND' || error.message === 'ERR_EMAIL_ALREADY_VERIFIED') {
        throw error;
      }
      throw new Error('ERR_RESEND_VERIFICATION_FAILED');
    }
  }
}

module.exports = new UserService();
