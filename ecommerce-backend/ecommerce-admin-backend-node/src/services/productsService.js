const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { pool } = require('../config/database');

class ProductsService {
  constructor() {
    this.mediaRoot = process.env.MEDIA_ROOT || '/data/admindata/picture';
    this.productsIdPattern = /^PID\d{3,}$/i;
  }

  ensureDirSync(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  decodeBase64Image(base64String) {
    if (!base64String || typeof base64String !== 'string') return null;
    let cleaned = base64String.trim();
    // Skip if it's not a base64 string (e.g., empty string, URL, or existing path)
    if (!cleaned || cleaned.length < 100) return null;
    if (!cleaned.includes('base64') && !/^[A-Za-z0-9+/=]+$/.test(cleaned)) return null;
    
    const dataUriMatch = cleaned.match(/^data:(.*?);base64,(.*)$/);
    if (dataUriMatch) {
      cleaned = dataUriMatch[2];
    }
    // Validate base64 string
    if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) return null;
    
    try {
    return { buffer: Buffer.from(cleaned, 'base64') };
    } catch (err) {
      console.error('[decodeBase64Image] Failed to decode base64:', err.message);
      return null;
    }
  }

  normalizeProductsId(value) {
    if (value === undefined || value === null) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    if (this.productsIdPattern.test(raw)) return raw.toUpperCase();
    if (/^\d+$/.test(raw)) return `PID${raw.padStart(5, '0')}`;
    throw new Error('ERR_INVALID_PRODUCTS_ID');
  }

  async assertProductsIdAvailable(productId) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM products WHERE products_id = ? LIMIT 1',
      [productId]
    );
    if (rows.length) {
      throw new Error('ERR_PRODUCTS_ID_EXISTS');
    }
  }

  async generateNextProductId() {
    const [rows] = await pool.execute(
      "SELECT products_id FROM products WHERE products_id LIKE 'PID%' ORDER BY products_id DESC LIMIT 1"
    );
    let nextNum = 1;
    if (rows && rows.length > 0 && rows[0].products_id) {
      const last = String(rows[0].products_id);
      const numeric = parseInt(last.replace(/[^0-9]/g, ''), 10);
      if (!Number.isNaN(numeric)) nextNum = numeric + 1;
    }
    return `PID${String(nextNum).padStart(5, '0')}`;
  }

  async resolveProductId(preferredId) {
    if (!preferredId) return this.generateNextProductId();
    const normalized = this.normalizeProductsId(preferredId);
    await this.assertProductsIdAvailable(normalized);
    return normalized;
  }

  async saveImageForProduct(productId, base64String, filePrefix = 'main') {
    const decoded = this.decodeBase64Image(base64String);
    if (!decoded) {
      console.log(`[saveImageForProduct] Skipping image save for ${filePrefix}: invalid or empty base64`);
      return null;
    }
    try {
    const productDir = path.join(this.mediaRoot, productId);
    this.ensureDirSync(productDir);
    const fileName = `${filePrefix}.webp`;
    await sharp(decoded.buffer).webp({ quality: 82 }).toFile(path.join(productDir, fileName));
    return `${productId}/${fileName}`.replace(/\\/g, '/');
    } catch (err) {
      console.error(`[saveImageForProduct] Failed to save image for ${filePrefix}:`, err.message);
      throw err;
    }
  }

  parseMaybeJson(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('data:') || /;base64,/.test(trimmed)) return value;
      try {
        JSON.parse(trimmed);
        return trimmed;
      } catch (_) {
        return JSON.stringify(trimmed);
      }
    }
    try {
      return JSON.stringify(value);
    } catch (_) {
      return null;
    }
  }

  async createProduct(payload) {
    const productId = await this.resolveProductId(payload.products_id);

    let imagePath = null;
    if (payload.image_url) {
      imagePath = await this.saveImageForProduct(productId, payload.image_url, 'main');
    }

    let galleryJson = null;
    if (payload.gallery) {
      try {
        const arr = Array.isArray(payload.gallery)
          ? payload.gallery
          : JSON.parse(typeof payload.gallery === 'string' ? payload.gallery : '[]');
        const saved = [];
        for (let idx = 0; idx < arr.length; idx += 1) {
          const b64 = arr[idx];
          // eslint-disable-next-line no-await-in-loop
          const rel = await this.saveImageForProduct(productId, b64, `gallery_${idx + 1}`);
          if (rel) saved.push(rel);
        }
        galleryJson = JSON.stringify(saved);
      } catch (_) {
        galleryJson = null;
      }
    }

    const slug = (payload.slug && String(payload.slug).trim())
      ? String(payload.slug).trim()
      : String(payload.name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 255);

    const colors = this.parseMaybeJson(payload.colors);
    const sizes = this.parseMaybeJson(payload.sizes);
    const tags = this.parseMaybeJson(payload.tags);

    const sql = `INSERT INTO products
      (products_id, slug, name, category, variant, short_description, description, price, original_price,
       stock, colors, sizes, image_url, gallery, rating, reviews, tags, is_featured, is_new)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
      productId,
      slug || null,
      payload.name || null,
      payload.category || null,
      payload.variant || null,
      payload.short_description || null,
      payload.description || null,
      payload.price ?? null,
      payload.original_price ?? null,
      payload.stock ?? 0,
      colors,
      sizes,
      imagePath,
      galleryJson,
      payload.rating ?? null,
      payload.reviews ?? null,
      tags,
      payload.is_featured ?? 0,
      payload.is_new ?? 0
    ];

    await pool.execute(sql, params);
    return this.getByIdOrCode(productId);
  }

  async listProducts(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (query.q) {
      where.push('(name LIKE ? OR slug LIKE ? OR category LIKE ? OR products_id LIKE ?)');
      const like = `%${query.q}%`;
      params.push(like, like, like, like);
    }
    if (query.category) {
      where.push('category = ?');
      params.push(String(query.category));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT * FROM products ${whereSql} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[countRow]] = await pool.execute(
      `SELECT COUNT(*) as total FROM products ${whereSql}`,
      params
    );

    return {
      items: rows,
      pagination: {
        page,
        limit,
        total: countRow.total || 0
      }
    };
  }

  async getByIdOrCode(idOrCode) {
    const idStr = String(idOrCode);
    const tryId = Number.isNaN(parseInt(idStr, 10)) ? null : parseInt(idStr, 10);

    const [byCode] = await pool.execute(
      'SELECT * FROM products WHERE products_id = ? LIMIT 1',
      [idStr]
    );
    if (byCode.length) return byCode[0];

    if (tryId !== null) {
      const [byPk] = await pool.execute(
        'SELECT * FROM products WHERE id = ? LIMIT 1',
        [tryId]
      );
      if (byPk.length) return byPk[0];
    }
    throw new Error('ERR_PRODUCT_NOT_FOUND');
  }

  async updateProduct(idOrCode, payload) {
    console.log('[updateProduct] Starting update for:', idOrCode);
    console.log('[updateProduct] Payload keys:', Object.keys(payload || {}));
    console.log('[updateProduct] Payload preview:', {
      name: payload?.name,
      variant: payload?.variant,
      category: payload?.category,
      hasImageUrl: Boolean(payload?.image_url),
      imageUrlType: typeof payload?.image_url,
      imageUrlLength: payload?.image_url?.length || 0
    });

    const current = await this.getByIdOrCode(idOrCode);
    const productId = current.products_id;

    const fields = [];
    const params = [];

    const setIfPresent = (column, value) => {
      if (value !== undefined) {
        fields.push(`${column} = ?`);
        params.push(value);
      }
    };

    // Only process image_url if it's a valid base64 string (not empty, not a URL/path)
    if (payload.image_url && typeof payload.image_url === 'string' && payload.image_url.trim().length > 100) {
      try {
      const rel = await this.saveImageForProduct(productId, payload.image_url, 'main');
      if (rel) {
        setIfPresent('image_url', rel);
          console.log('[updateProduct] Image saved successfully');
        }
      } catch (err) {
        console.error('[updateProduct] Failed to save image:', err.message);
        // Don't throw - allow other fields to be updated even if image fails
      }
    } else if (payload.image_url !== undefined) {
      console.log('[updateProduct] Skipping image_url (not a valid base64 string)');
    }

    if (payload.gallery) {
      try {
        const arr = Array.isArray(payload.gallery)
          ? payload.gallery
          : JSON.parse(typeof payload.gallery === 'string' ? payload.gallery : '[]');
        const saved = [];
        for (let idx = 0; idx < arr.length; idx += 1) {
          const b64 = arr[idx];
          // eslint-disable-next-line no-await-in-loop
          const rel = await this.saveImageForProduct(productId, b64, `gallery_${idx + 1}`);
          if (rel) saved.push(rel);
        }
        setIfPresent('gallery', JSON.stringify(saved));
      } catch (_) { /* ignore */ }
    }

    const colors = this.parseMaybeJson(payload.colors);
    const sizes = this.parseMaybeJson(payload.sizes);
    const tags = this.parseMaybeJson(payload.tags);

    setIfPresent('name', payload.name);
    setIfPresent('price', payload.price);
    setIfPresent('stock', payload.stock);
    setIfPresent('description', payload.description);
    setIfPresent('slug', payload.slug);
    setIfPresent('category', payload.category);
    setIfPresent('variant', payload.variant);
    setIfPresent('short_description', payload.short_description);
    setIfPresent('original_price', payload.original_price);
    if (colors !== null && payload.colors !== undefined) setIfPresent('colors', colors);
    if (sizes !== null && payload.sizes !== undefined) setIfPresent('sizes', sizes);
    if (tags !== null && payload.tags !== undefined) setIfPresent('tags', tags);
    if (payload.rating !== undefined) setIfPresent('rating', payload.rating);
    if (payload.reviews !== undefined) setIfPresent('reviews', payload.reviews);
    if (payload.is_featured !== undefined) setIfPresent('is_featured', payload.is_featured);
    if (payload.is_new !== undefined) setIfPresent('is_new', payload.is_new);

    if (fields.length === 0) {
      console.log('[updateProduct] No fields to update, returning current product');
      return current;
    }

    console.log('[updateProduct] Updating fields:', fields.map(f => f.split('=')[0].trim()));
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE products_id = ? OR id = ?`;
    params.push(productId, current.id);
    
    try {
    await pool.execute(sql, params);
      console.log('[updateProduct] Update successful');
    return this.getByIdOrCode(productId);
    } catch (err) {
      console.error('[updateProduct] SQL error:', err.message);
      console.error('[updateProduct] SQL:', sql);
      console.error('[updateProduct] Params:', params);
      throw err;
    }
  }

  async deleteProduct(idOrCode) {
    const current = await this.getByIdOrCode(idOrCode);
    const productId = current.products_id;

    await pool.execute(
      'DELETE FROM products WHERE products_id = ? OR id = ? LIMIT 1',
      [productId, current.id]
    );

    try {
      const productDir = path.join(this.mediaRoot, productId);
      if (fs.existsSync(productDir)) {
        fs.rmSync(productDir, { recursive: true, force: true });
      }
    } catch (_) {
      // ignore fs errors
    }

    return { success: true };
  }

  async getAllTags() {
    try {
      const [rows] = await pool.execute(
        'SELECT tags FROM products WHERE tags IS NOT NULL AND tags != "null" AND tags != ""'
      );
      
      const allTags = [];
      for (const row of rows) {
        let tags = [];
        try {
          if (typeof row.tags === 'string') {
            const parsed = JSON.parse(row.tags);
            tags = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(row.tags)) {
            tags = row.tags;
          }
        } catch (_) {
          // ignore parse errors
        }
        
        for (const tag of tags) {
          if (typeof tag === 'string' && tag.trim() !== '') {
            allTags.push(tag.trim());
          }
        }
      }
      
      // Remove duplicates and sort
      const uniqueTags = [...new Set(allTags)].sort();
      return uniqueTags;
    } catch (err) {
      console.error('getAllTags error:', err);
      throw new Error('ERR_GET_TAGS_FAILED');
    }
  }

  async getAllCategories() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" AND category != "null" ORDER BY category'
      );
      
      const categories = rows
        .map((row) => row.category)
        .filter((cat) => typeof cat === 'string' && cat.trim() !== '')
        .map((cat) => cat.trim());
      
      // Remove duplicates and sort
      const uniqueCategories = [...new Set(categories)].sort();
      return uniqueCategories;
    } catch (err) {
      console.error('getAllCategories error:', err);
      throw new Error('ERR_GET_CATEGORIES_FAILED');
    }
  }
}

module.exports = new ProductsService();

