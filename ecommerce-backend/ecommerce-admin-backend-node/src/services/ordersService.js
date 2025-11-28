const { pool } = require('../config/database');

const RESTORE_STOCK_STATUSES = new Set(['refunded', 'refund', 'returned', 'return', 'cancelled', 'canceled']);
const ACTIVE_FULFILLMENT_STATUSES = new Set(['pending', 'processing', 'confirmed', 'paid', 'completed', 'shipping', 'shipped', 'fulfillment']);

const parseOrderItems = (rawItems) => {
  if (!rawItems) return [];
  if (Array.isArray(rawItems)) return rawItems;
  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  return [];
};

const getItemQuantity = (item) => {
  const qty = Number(item?.qty ?? item?.quantity ?? item?.qtyOrdered ?? 0);
  return Number.isFinite(qty) && qty > 0 ? qty : 0;
};

const resolveProductId = async (connection, item) => {
  const direct =
    item?.productId ?? item?.product_id ?? item?.productID ?? null;
  if (direct && Number.isInteger(Number(direct))) {
    return Number(direct);
  }

  if (item?.products_id) {
    const [rows] = await connection.execute(
      'SELECT id FROM products WHERE products_id = ? LIMIT 1',
      [item.products_id]
    );
    if (rows.length) {
      return rows[0].id;
    }
  }

  return null;
};

const adjustStockForItems = async (connection, items, mode) => {
  for (const raw of items) {
    const qty = getItemQuantity(raw);
    if (!qty) continue;
    const productId = await resolveProductId(connection, raw);
    if (!productId) continue;

    if (mode === 'restore') {
      await connection.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [qty, productId]
      );
    } else if (mode === 'deduct') {
      const [result] = await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [qty, productId, qty]
      );
      if (!result || (typeof result.affectedRows === 'number' && result.affectedRows === 0)) {
        throw new Error('ERR_INSUFFICIENT_STOCK');
      }
    }
  }
};

const handleStockForStatusChange = async (connection, orderRow, nextStatus) => {
  if (!orderRow || !orderRow.products_items) return;
  const previousStatus = (orderRow.status || '').toLowerCase();
  const normalizedNext = (nextStatus || '').toLowerCase();
  const items = parseOrderItems(orderRow.products_items);
  if (!items.length) return;

  if (RESTORE_STOCK_STATUSES.has(normalizedNext) && !RESTORE_STOCK_STATUSES.has(previousStatus)) {
    await adjustStockForItems(connection, items, 'restore');
  } else if (ACTIVE_FULFILLMENT_STATUSES.has(normalizedNext) && RESTORE_STOCK_STATUSES.has(previousStatus)) {
    await adjustStockForItems(connection, items, 'deduct');
  }
};

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
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [orders] = await connection.execute(
        'SELECT id, order_id, status, products_items FROM orders WHERE id = ? FOR UPDATE',
        [orderPkId]
      );
      if (!orders.length) {
        throw new Error('ERR_ORDER_NOT_FOUND');
      }

      await connection.execute(
        'UPDATE orders SET status = ?, update_date = NOW() WHERE id = ?',
        [status, orderPkId]
      );

      await handleStockForStatusChange(connection, orders[0], status);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.getOrderById(orderPkId);
  }

  async updateOrderStatusByOrderId(orderId, status) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [orders] = await connection.execute(
        'SELECT id, order_id, status, products_items FROM orders WHERE order_id = ? FOR UPDATE',
        [orderId]
      );
      if (!orders.length) {
        throw new Error('ERR_ORDER_NOT_FOUND');
      }

      await connection.execute(
        'UPDATE orders SET status = ?, update_date = NOW() WHERE order_id = ?',
        [status, orderId]
      );

      await handleStockForStatusChange(connection, orders[0], status);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.getOrderByOrderId(orderId);
  }
}

module.exports = new OrdersService();