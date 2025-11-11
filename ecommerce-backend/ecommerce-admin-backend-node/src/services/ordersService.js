const { pool } = require('../config/database');

class OrdersService {
  async listOrders(page = 1, limit = 10, filters = {}) {
    const limitNum = parseInt(limit);
    const offsetNum = (parseInt(page) - 1) * limitNum;

    const whereParts = [];
    const params = [];

    if (filters.status && typeof filters.status === 'string' && filters.status.trim() !== '') {
      whereParts.push('status = ?');
      params.push(filters.status.trim());
    }
    if (filters.order_id && typeof filters.order_id === 'string' && filters.order_id.trim() !== '') {
      whereParts.push('order_id = ?');
      params.push(filters.order_id.trim());
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM orders ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [orders] = await pool.query(
      `SELECT id,
              order_id,
              user_id,
              user_name,
              user_address,
              user_phone,
              products_name,
              products_items,
              products_price,
              payment_status,
              total_price,
              payment_method,
              status,
              create_date,
              update_date
       FROM orders
       ${whereClause}
       ORDER BY create_date DESC
       LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getOrderById(orderPkId) {
    const [rows] = await pool.execute(
      'SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, payment_status, total_price, payment_method, status, create_date, update_date FROM orders WHERE id = ? LIMIT 1',
      [orderPkId]
    );
    if (rows.length === 0) throw new Error('ERR_ORDER_NOT_FOUND');
    return rows[0];
  }

  async getOrderByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, payment_status, total_price, payment_method, status, create_date, update_date FROM orders WHERE order_id = ? LIMIT 1',
      [orderId]
    );
    if (rows.length === 0) throw new Error('ERR_ORDER_NOT_FOUND');
    return rows[0];
  }

  async updateOrderStatus(orderPkId, status) {
    await pool.execute(
      'UPDATE orders SET status = ?, update_date = NOW() WHERE id = ?',
      [status, orderPkId]
    );
    return this.getOrderById(orderPkId);
  }

  async updateOrderStatusByOrderId(orderId, status) {
    const [result] = await pool.execute(
      'UPDATE orders SET status = ?, update_date = NOW() WHERE order_id = ?',
      [status, orderId]
    );
    // If no rows changed/affected, treat as not found
    if (!result || (typeof result.affectedRows === 'number' && result.affectedRows === 0)) {
      throw new Error('ERR_ORDER_NOT_FOUND');
    }
    return this.getOrderByOrderId(orderId);
  }
}

module.exports = new OrdersService();



