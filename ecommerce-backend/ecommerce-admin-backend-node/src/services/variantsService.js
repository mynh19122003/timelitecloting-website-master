const { pool } = require('../config/database');

class VariantsService {
  async listVariants(filters = {}) {
    const params = [];
    let sql = 'SELECT * FROM product_variants';

    if (filters.category) {
      sql += ' WHERE category_slug = ?';
      params.push(filters.category);
    }

    sql += ' ORDER BY category_slug ASC, sort_order ASC, variant_name ASC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async createVariant(variantName, categorySlug) {
    if (!variantName) {
      throw new Error('ERR_VARIANT_NAME_REQUIRED');
    }

    if (!categorySlug) {
      throw new Error('ERR_VARIANT_CATEGORY_REQUIRED');
    }

    // Check existing
    const [existing] = await pool.execute(
      'SELECT * FROM product_variants WHERE variant_name = ? AND category_slug = ? LIMIT 1',
      [variantName, categorySlug]
    );

    if (existing.length > 0) {
      return existing[0];
    }

    const [[{ nextOrder }]] = await pool.execute(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM product_variants WHERE category_slug = ?',
      [categorySlug]
    );

    const sortOrder = nextOrder || 1;

    const [result] = await pool.execute(
      'INSERT INTO product_variants (variant_name, category_slug, sort_order) VALUES (?, ?, ?)',
      [variantName, categorySlug, sortOrder]
    );

    return { id: result.insertId, variant_name: variantName, category_slug: categorySlug, sort_order: sortOrder };
  }
}

module.exports = new VariantsService();

