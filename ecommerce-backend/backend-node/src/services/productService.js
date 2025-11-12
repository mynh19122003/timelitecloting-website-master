const { pool } = require('../config/database');

// Normalize image_url so storefronts always get a fetchable URL
// - Absolute (http/https/data) → return as-is
// - Already prefixed with /admin/admindata/picture → return as-is
// - Relative like "PID00001/main.webp" → prefix with /admin/admindata/picture/
// - Leading slashes are trimmed when joining
function resolveImageUrl(raw, productsId = null) {
  if (!raw || typeof raw !== 'string') return raw;
  const url = raw.trim();
  if (!url) return url;
  const isAbsolute = /^(https?:)?\/\//i.test(url) || url.startsWith('data:');
  if (isAbsolute) return url;
  if (url.startsWith('/admin/admindata/picture/')) return url;
  // Support old format for backward compatibility
  if (url.startsWith('/admin/media/')) {
    // Convert old format to new format
    return url.replace('/admin/media/admin/data/picture/', '/admin/admindata/picture/');
  }

  // Extract PID from productsId if available, otherwise try to extract from URL
  let pid = productsId;
  if (!pid && url.match(/^PID\d+/i)) {
    pid = url.match(/^(PID\d+)/i)[1];
  }
  
  // If we have a PID, use the new format: /admin/admindata/picture/<PID>/main.webp
  if (pid) {
    const fileName = url.includes('/') ? url.split('/').pop() : 'main.webp';
    return `/admin/admindata/picture/${pid}/${fileName}`;
  }

  // Fallback: use old format for backward compatibility
  const adminBase = process.env.ADMIN_BASE && process.env.ADMIN_BASE.trim() ? process.env.ADMIN_BASE.trim() : '/admin';
  const base = adminBase.endsWith('/') ? adminBase.slice(0, -1) : adminBase;
  const cleaned = url.replace(/^\/?(admin\/media\/)?/, '');
  return `${base}/media/${cleaned}`;
}

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

      const normalized = products.map((p) => ({
        ...p,
        image_url: resolveImageUrl(p.image_url, p.products_id)
      }));

      return {
        products: normalized,
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

      const product = products[0];
      return {
        ...product,
        image_url: resolveImageUrl(product.image_url, product.products_id)
      };
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
