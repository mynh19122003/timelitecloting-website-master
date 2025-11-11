const productsService = require('../services/productsService');

class ProductsController {
  async list(req, res) {
    try {
      const result = await productsService.listProducts(req.query || {});
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error('list products failed:', err);
      return res.status(500).json({ error: 'ERR_LIST_PRODUCTS_FAILED', message: 'Failed to list products' });
    }
  }

  async create(req, res) {
    try {
      try {
        const body = req.body || {};
        const keys = Object.keys(body);
        console.log('[PRODUCTS][CREATE] Incoming body keys:', keys);
        console.log('[PRODUCTS][CREATE] Preview:', {
          name: body?.name,
          price: body?.price,
          stock: body?.stock,
          hasImageUrl: Boolean(body?.image_url),
          galleryType: Array.isArray(body?.gallery) ? 'array' : (typeof body?.gallery),
          contentType: req.headers?.['content-type']
        });
      } catch (_) {}
      const created = await productsService.createProduct(req.body || {});
      return res.status(201).json({ success: true, message: 'Product created', data: created });
    } catch (err) {
      console.error('create product failed:', err);
      return res.status(500).json({ error: 'ERR_CREATE_PRODUCT_FAILED', message: 'Failed to create product' });
    }
  }

  async get(req, res) {
    try {
      const { id } = req.params;
      const product = await productsService.getByIdOrCode(id);
      return res.json({ success: true, data: product });
    } catch (err) {
      if (err.message === 'ERR_PRODUCT_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      console.error('get product failed:', err);
      return res.status(500).json({ error: 'ERR_GET_PRODUCT_FAILED', message: 'Failed to get product' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await productsService.updateProduct(id, req.body || {});
      return res.json({ success: true, message: 'Product updated', data: updated });
    } catch (err) {
      if (err.message === 'ERR_PRODUCT_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      console.error('update product failed:', err);
      return res.status(500).json({ error: 'ERR_UPDATE_PRODUCT_FAILED', message: 'Failed to update product' });
    }
  }
}

module.exports = new ProductsController();



