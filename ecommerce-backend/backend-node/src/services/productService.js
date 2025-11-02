const { pool } = require('../config/database');

class ProductService {
  async getProducts(page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC') {
    try {
      const offset = (page - 1) * limit;
      
      // Build search condition
      let searchCondition = '';
      let searchParams = [];
      
      if (search) {
        searchCondition = 'WHERE name LIKE ?';
        searchParams.push(`%${search}%`);
      }

      // Validate sortBy
      const allowedSortFields = ['name', 'price', 'created_at'];
      if (!allowedSortFields.includes(sortBy)) {
        sortBy = 'created_at';
      }

      // Validate sortOrder
      const allowedSortOrders = ['ASC', 'DESC'];
      if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
        sortOrder = 'DESC';
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM products ${searchCondition}`;
      const [countResult] = await pool.execute(countQuery, searchParams);
      const total = countResult[0].total;

      // Get products
      const productsQuery = `
        SELECT id, products_id, slug, name, description, price, stock, image_url, created_at 
        FROM products 
        ${searchCondition}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      const [products] = await pool.execute(productsQuery, [...searchParams, limit, offset]);

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error('ERR_GET_PRODUCTS_FAILED');
    }
  }

  async getProductById(productId) {
    try {
      const [products] = await pool.execute(
        'SELECT id, products_id, slug, name, description, price, stock, image_url, created_at FROM products WHERE id = ?',
        [productId]
      );

      if (products.length === 0) {
        throw new Error('ERR_PRODUCT_NOT_FOUND');
      }

      return products[0];
    } catch (error) {
      if (error.message === 'ERR_PRODUCT_NOT_FOUND') {
        throw error;
      }
      throw new Error('ERR_GET_PRODUCT_FAILED');
    }
  }

  async checkStock(productId, quantity) {
    try {
      const [products] = await pool.execute(
        'SELECT stock FROM products WHERE id = ?',
        [productId]
      );

      if (products.length === 0) {
        throw new Error('ERR_PRODUCT_NOT_FOUND');
      }

      const availableStock = products[0].stock;
      if (availableStock < quantity) {
        throw new Error('ERR_INSUFFICIENT_STOCK');
      }

      return true;
    } catch (error) {
      if (error.message === 'ERR_PRODUCT_NOT_FOUND' || error.message === 'ERR_INSUFFICIENT_STOCK') {
        throw error;
      }
      throw new Error('ERR_CHECK_STOCK_FAILED');
    }
  }

  async updateStock(productId, quantity) {
    try {
      await pool.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [quantity, productId]
      );
    } catch (error) {
      throw new Error('ERR_UPDATE_STOCK_FAILED');
    }
  }
}

module.exports = new ProductService();
