const { pool } = require('../config/database');

class UsersService {
  async listCustomers(page = 1, limit = 10, q = '') {
    const limitNum = parseInt(limit);
    const offsetNum = (parseInt(page) - 1) * limitNum;

    const whereParts = [];
    const params = [];
    if (q && typeof q === 'string' && q.trim() !== '') {
      const like = `%${q.trim()}%`;
      whereParts.push('(email LIKE ? OR user_name LIKE ? OR user_phone LIKE ? OR user_code LIKE ?)');
      params.push(like, like, like, like);
    }
    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT id,
              user_code,
              email,
              user_name,
              user_phone,
              user_address,
              created_at,
              updated_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );

    return {
      customers: rows,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getCustomer(identifier) {
    let field = 'id';
    let value = identifier;
    if (typeof identifier === 'string') {
      if (identifier.includes('@')) {image.png
        field = 'email';
      } else if (/^UID\d{5,}$/i.test(identifier)) {
        field = 'user_code';
      } else if (!/^[0-9]+$/.test(identifier)) {
        // fallback string: try user_code first
        field = 'user_code';
      }
    }
    if (field === 'id') value = parseInt(identifier);

    const [rows] = await pool.execute(
      `SELECT id, user_code, email, user_name, user_phone, user_address, created_at, updated_at
       FROM users WHERE ${field} = ? LIMIT 1`,
      [value]
    );
    if (rows.length === 0) throw new Error('ERR_USER_NOT_FOUND');
    return rows[0];
  }

  async updateCustomer(identifier, payload) {
    // Resolve to numeric id first
    const current = await this.getCustomer(identifier);
    const userId = current.id;

    const fields = [];
    const params = [];

    // Compute user_name if first/last provided
    let computedName = null;
    if (typeof payload.user_name === 'string' && payload.user_name.trim() !== '') {
      computedName = payload.user_name.trim();
    } else {
      const first = (payload.first_name || '').trim();
      const last = (payload.last_name || '').trim();
      const full = `${first} ${last}`.trim();
      if (full) computedName = full;
    }

    if (computedName !== null) {
      fields.push('user_name = ?');
      params.push(computedName);
    }

    if (typeof payload.phone === 'string') {
      fields.push('user_phone = ?');
      params.push(payload.phone);
    }

    if (typeof payload.email === 'string') {
      fields.push('email = ?');
      params.push(payload.email);
    }

    // Address: accept flat or nested
    let street = payload.street_address;
    let city = payload.city;
    let state = payload.state;
    let postal = payload.postal_code;
    if (payload.address && typeof payload.address === 'object') {
      street = street ?? payload.address.street;
      city = city ?? payload.address.city;
      state = state ?? payload.address.state;
      postal = postal ?? payload.address.postal_code;
    }
    const parts = [];
    if (street && String(street).trim()) parts.push(String(street).trim());
    const cityState = [city, state].filter(v => v && String(v).trim()).join(', ');
    if (cityState) parts.push(cityState);
    if (postal && String(postal).trim()) parts.push(String(postal).trim());
    const addressStr = parts.join(', ');
    if (addressStr) {
      fields.push('user_address = ?');
      params.push(addressStr);
    }

    if (fields.length === 0) {
      // nothing to update
      return this.getCustomer(userId);
    }

    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(userId);
    await pool.execute(sql, params);

    return this.getCustomer(userId);
  }
}

module.exports = new UsersService();


