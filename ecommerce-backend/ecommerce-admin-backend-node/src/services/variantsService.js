const { pool } = require('../config/database');

class VariantsService {
  async listVariants() {
    const [rows] = await pool.execute(
      'SELECT * FROM product_variants ORDER BY variant_name ASC'
    );
    return rows;
  }

  async createVariant(variantName) {
    if (!variantName) {
      throw new Error('ERR_VARIANT_NAME_REQUIRED');
    }

    // Check existing
    const [existing] = await pool.execute(
      'SELECT * FROM product_variants WHERE variant_name = ? LIMIT 1',
      [variantName]
    );

    if (existing.length > 0) {
       return existing[0];
    }

    const [result] = await pool.execute(
      'INSERT INTO product_variants (variant_name) VALUES (?)',
      [variantName]
    );

    return { id: result.insertId, variant_name: variantName };
  }
}

module.exports = new VariantsService();

