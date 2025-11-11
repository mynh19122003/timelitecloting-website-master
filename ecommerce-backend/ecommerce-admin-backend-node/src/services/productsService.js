const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { pool } = require('../config/database');

class ProductsService {
  constructor() {
    // MEDIA_ROOT: thư mục gốc để lưu ảnh, có thể mount vào Docker volume
    // Mặc định theo yêu cầu mới: /data/admindata/picture
    this.mediaRoot = process.env.MEDIA_ROOT || '/data/admindata/picture';
  }

  ensureDirSync(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Loại bỏ prefix data URI nếu có; luôn chuyển sang buffer gốc
  decodeBase64Image(base64String) {
    if (!base64String || typeof base64String !== 'string') return null;
    let cleaned = base64String.trim();
    const dataUriMatch = cleaned.match(/^data:(.*?);base64,(.*)$/);
    if (dataUriMatch) {
      cleaned = dataUriMatch[2];
    }
    const buffer = Buffer.from(cleaned, 'base64');
    return { buffer };
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
    // PID + 5 chữ số, ví dụ PID00001
    return `PID${String(nextNum).padStart(5, '0')}`;
  }

  async saveImageForProduct(productId, base64String, filePrefix = 'main') {
    const decoded = this.decodeBase64Image(base64String);
    if (!decoded) return null;
    const { buffer } = decoded;
    const productDir = path.join(this.mediaRoot, productId);
    this.ensureDirSync(productDir);
    const fileName = `${filePrefix}.webp`;
    const absPath = path.join(productDir, fileName);
    // Convert to WEBP for smaller size
    await sharp(buffer)
      .webp({ quality: 82 })
      .toFile(absPath);
    // Trả về path tương đối tính từ mediaRoot để lưu DB
    const relPath = `${productId}/${fileName}`.replace(/\\/g, '/');
    return relPath;
  }

  parseMaybeJson(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string') {
      // Nếu là base64 ảnh thì không parse
      const trimmed = value.trim();
      if (trimmed.startsWith('data:') || /;base64,/.test(trimmed)) return value;
      // Nếu là JSON string hợp lệ thì giữ nguyên
      try {
        JSON.parse(trimmed);
        return trimmed; // đã là JSON string
      } catch (_) {
        // Không phải JSON string, chuyển thành JSON string từ primitive
        return JSON.stringify(trimmed);
      }
    }
    // object/array -> stringify
    try {
      return JSON.stringify(value);
    } catch (_) {
      return null;
    }
  }

  async createProduct(payload) {
    const productId = await this.generateNextProductId();

    // Ảnh chính
    let imagePath = null;
    if (payload.image_url) {
      imagePath = await this.saveImageForProduct(productId, payload.image_url, 'main');
    }

    // Gallery (mảng base64) -> lưu file và lưu danh sách đường dẫn tương đối
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
      (products_id, name, price, stock, description, image_url, slug, category, short_description,
       original_price, colors, sizes, gallery, rating, reviews, tags, is_featured, is_new)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
      productId,
      payload.name || null,
      payload.price ?? null,
      payload.stock ?? 0,
      payload.description || null,
      imagePath,
      slug || null,
      payload.category || null,
      payload.short_description || null,
      payload.original_price ?? null,
      colors,
      sizes,
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

    // MySQL may reject parameter markers for LIMIT/OFFSET in some client configs
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
    // Ưu tiên products_id, sau đó id số nguyên
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

    // Ảnh
    if (payload.image_url) {
      const rel = await this.saveImageForProduct(productId, payload.image_url, 'main');
      if (rel) {
        setIfPresent('image_url', rel);
      }
    }

    // Gallery
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
      return current; // không có gì để cập nhật
    }

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE products_id = ? OR id = ?`;
    params.push(productId, current.id);
    await pool.execute(sql, params);

    return this.getByIdOrCode(productId);
  }
}

module.exports = new ProductsService();


