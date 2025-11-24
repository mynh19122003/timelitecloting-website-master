const { pool } = require('../config/database');

class OrderService {
  async createOrder(userId, items, orderDetails = {}) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('ERR_VALIDATION_FAILED');
      }

      // Validate stock and compute totals and names
      let totalAmount = 0;
      const normalizedItems = [];
      const nameParts = [];

      for (const item of items) {
        const qty = parseInt(item.quantity || item.qty);
        let productId = item.product_id ? parseInt(item.product_id) : undefined;
        let color = item.color || null;
        let size = item.size || null;
        let productsId = item.products_id || null; // string PID0000x

        // Resolve by products_id first if provided
        if (!productId && productsId) {
          const [prow] = await connection.execute(
            'SELECT id FROM products WHERE products_id = ? FOR UPDATE',
            [productsId]
          );
          if (prow.length === 0) {
            throw new Error('ERR_PRODUCT_NOT_FOUND');
          }
          productId = prow[0].id;
        }

        // Fallback: resolve by product_slug
        if (!productId && item.product_slug) {
          const [prow] = await connection.execute(
            'SELECT id FROM products WHERE slug = ? FOR UPDATE',
            [item.product_slug]
          );
          if (prow.length === 0) {
            throw new Error('ERR_PRODUCT_NOT_FOUND');
          }
          productId = prow[0].id;
        }

        if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty <= 0) {
          throw new Error('ERR_VALIDATION_FAILED');
        }

        const [rows] = await connection.execute(
          'SELECT id, name, price, stock, products_id FROM products WHERE id = ? FOR UPDATE',
          [productId]
        );
        if (rows.length === 0) {
          throw new Error('ERR_PRODUCT_NOT_FOUND');
        }
        const product = rows[0];
        if (product.stock < qty) {
          throw new Error('ERR_INSUFFICIENT_STOCK');
        }

        totalAmount += Number(product.price) * qty;
        normalizedItems.push({ productId: product.id, products_id: product.products_id, qty, price: Number(product.price), color, size, name: product.name });
        const nameLabel = product.name + (color ? ` (${color}${size ? `/${size}` : ''})` : (size ? ` (${size})` : ''));
        nameParts.push(`${nameLabel} x${qty}`);
      }

      // Allow override total_amount if provided and numeric
      if (orderDetails.total_amount && !isNaN(Number(orderDetails.total_amount))) {
        totalAmount = Number(orderDetails.total_amount);
      }

      // Compose fields
      const productsPrice = totalAmount;
      const shippingCost = orderDetails.shipping_cost ? Number(orderDetails.shipping_cost) : 0;
      const totalPrice = productsPrice + shippingCost;
      const userName = `${(orderDetails.firstname || '').trim()} ${(orderDetails.lastname || '').trim()}`.trim();
      const userAddress = orderDetails.address || null;
      const userPhone = orderDetails.phonenumber || null;
      const paymentMethod = orderDetails.payment_method || 'cod';
      const paymentStatus = paymentMethod === 'bank_transfer' ? 'paid' : 'unpaid';
      const productsName = nameParts.join(', ');
      const productsItems = JSON.stringify(normalizedItems);

      // Extract all additional fields
      const email = orderDetails.email || null;
      const company = orderDetails.company || null;
      const streetAddress = orderDetails.street_address || null;
      const apartment = orderDetails.apartment || null;
      const city = orderDetails.city || null;
      const state = orderDetails.state || null;
      const zip = orderDetails.zip || null;
      const country = orderDetails.country || null;
      const shippingMethod = orderDetails.shipping_method || null;
      const shippingFirstname = orderDetails.shipping_firstname || null;
      const shippingLastname = orderDetails.shipping_lastname || null;
      const shippingCompany = orderDetails.shipping_company || null;
      const shippingAddress = orderDetails.shipping_address || null;
      const shippingPhone = orderDetails.shipping_phone || null;
      const billingFirstname = orderDetails.billing_firstname || null;
      const billingLastname = orderDetails.billing_lastname || null;
      const billingCompany = orderDetails.billing_company || null;
      const billingAddress = orderDetails.billing_address || null;
      const billingPhone = orderDetails.billing_phone || null;
      const notes = orderDetails.notes || null;

      // Create order (new structure with all fields)
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          user_id, user_name, user_address, user_phone, 
          email, company, street_address, apartment, city, state, zip, country,
          shipping_method, shipping_cost, shipping_firstname, shipping_lastname, 
          shipping_company, shipping_address, shipping_phone,
          billing_firstname, billing_lastname, billing_company, billing_address, billing_phone,
          products_name, products_items, products_price, total_price, 
          payment_method, payment_status, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, userName, userAddress, userPhone,
          email, company, streetAddress, apartment, city, state, zip, country,
          shippingMethod, shippingCost, shippingFirstname, shippingLastname,
          shippingCompany, shippingAddress, shippingPhone,
          billingFirstname, billingLastname, billingCompany, billingAddress, billingPhone,
          productsName, productsItems, productsPrice, totalPrice,
          paymentMethod, paymentStatus, 'pending', notes
        ]
      );
      const orderId = orderResult.insertId;

      // Generate order_id like ORD00001 (5 digits)
      await connection.execute(
        "UPDATE orders SET order_id = CONCAT('ORD', LPAD(id, 5, '0')) WHERE id = ?",
        [orderId]
      );

      // Deduct stock per item
      for (const ni of normalizedItems) {
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [ni.qty, ni.productId]
        );
      }

      await connection.commit();

      return await this.getOrderById(orderId, userId);
    } catch (error) {
      await connection.rollback();
      console.error('Error creating order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrderHistory(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);

      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
        [userId]
      );
      const total = countResult[0].total;

      const [orders] = await pool.query(
        `SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, total_price, payment_method, payment_status, status, create_date, update_date
         FROM orders 
         WHERE user_id = ? 
         ORDER BY create_date DESC 
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [userId]
      );

      // No order_items table; orders already include products_name and products_price

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      console.error('Error getting order history:', error);
      throw new Error('ERR_GET_ORDER_HISTORY_FAILED');
    }
  }

  async getOrderById(orderId, userId) {
    try {
      const [orders] = await pool.execute(
        'SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, total_price, payment_method, payment_status, status, create_date, update_date FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      );
      if (orders.length === 0) {
        throw new Error('ERR_ORDER_NOT_FOUND');
      }
      const order = orders[0];
      return order;
    } catch (error) {
      if (error.message === 'ERR_ORDER_NOT_FOUND') {
        throw error;
      }
      console.error('Error getting order by ID:', error);
      throw new Error('ERR_GET_ORDER_FAILED');
    }
  }
}

module.exports = new OrderService();
