const productsService = require('../services/productsService');
const { buildPayloadPreview } = require('../utils/payloadPreview');

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
        console.log('[PRODUCTS][CREATE] Payload snapshot:', buildPayloadPreview(body, { stringLimit: 384 }));
      } catch (_) {}
      const created = await productsService.createProduct(req.body || {});
      return res.status(201).json({ success: true, message: 'Product created', data: created });
    } catch (err) {
      console.error('create product failed:', err);
      return res.status(500).json({ error: 'ERR_CREATE_PRODUCT_FAILED', message: 'Failed to create product' });
    }
  }

  async bulkCreate(req, res) {
    try {
      const { products } = req.body || {};
      console.log('[PRODUCTS][BULK_CREATE] ========================================');
      console.log('[PRODUCTS][BULK_CREATE] Full request body:', JSON.stringify(req.body, null, 2));
      console.log('[PRODUCTS][BULK_CREATE] Received', products?.length || 0, 'products');
      console.log('[PRODUCTS][BULK_CREATE] Request body keys:', Object.keys(req.body || {}));
      
      // Log chi tiết từng sản phẩm
      if (Array.isArray(products)) {
        products.forEach((p, idx) => {
          console.log(`[PRODUCTS][BULK_CREATE] Product #${idx + 1} full data:`, JSON.stringify({
            name: p?.name,
            description: p?.description,
            price: p?.price,
            inventory: p?.inventory,
            category: p?.category,
            variant: p?.variant,
            color: p?.color,
            status: p?.status,
            rating: p?.rating,
            sizes: p?.sizes,
            tags: p?.tags,
            hasImagePreview: Boolean(p?.imagePreview),
            imagePreviewLength: p?.imagePreview?.length || 0,
            mediaUploadsCount: p?.mediaUploads?.length || 0,
            mediaUploads: p?.mediaUploads?.map(m => ({
              id: m?.id,
              name: m?.name,
              dataUrlLength: m?.dataUrl?.length || 0
            })) || []
          }, null, 2));
        });
      } else {
        console.log('[PRODUCTS][BULK_CREATE] Products is not an array:', typeof products, products);
      }
      
      const result = await productsService.bulkCreateProducts(products || []);
      
      console.log('[PRODUCTS][BULK_CREATE] Result:', {
        successCount: result.successCount,
        failedCount: result.failedCount
      });
      console.log('[PRODUCTS][BULK_CREATE] ========================================');
      
      return res.status(201).json({
        success: true,
        message: `Created ${result.successCount} product(s), ${result.failedCount} failed`,
        data: result
      });
    } catch (err) {
      console.error('[PRODUCTS][BULK_CREATE] ========================================');
      console.error('[PRODUCTS][BULK_CREATE] Error:', err.message);
      console.error('[PRODUCTS][BULK_CREATE] Stack:', err.stack);
      console.error('[PRODUCTS][BULK_CREATE] ========================================');
      return res.status(500).json({
        error: 'ERR_BULK_CREATE_PRODUCTS_FAILED',
        message: 'Failed to bulk create products'
      });
    }
  }

  async get(req, res) {
    try {
      const { id } = req.params;
      console.log('[get] Called with id:', id, 'URL:', req.originalUrl || req.url);
      // Prevent matching "tags" as an ID
      if (id === 'tags') {
        console.log('[get] WARNING: /tags was matched by /:id route! This should not happen.');
        return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
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
      console.log('[PRODUCTS][UPDATE] Request for product:', id);
      console.log('[PRODUCTS][UPDATE] Body keys:', Object.keys(req.body || {}));
      console.log('[PRODUCTS][UPDATE] Body preview:', {
        name: req.body?.name,
        variant: req.body?.variant,
        category: req.body?.category,
        hasImageUrl: Boolean(req.body?.image_url),
        imageUrlType: typeof req.body?.image_url
      });
      
      const updated = await productsService.updateProduct(id, req.body || {});
      console.log('[PRODUCTS][UPDATE] Success');
      return res.json({ success: true, message: 'Product updated', data: updated });
    } catch (err) {
      if (err.message === 'ERR_PRODUCT_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      console.error('[PRODUCTS][UPDATE] Error:', err.message);
      console.error('[PRODUCTS][UPDATE] Stack:', err.stack);
      console.error('[PRODUCTS][UPDATE] Full error:', err);
      return res.status(500).json({ 
        error: 'ERR_UPDATE_PRODUCT_FAILED', 
        message: err.message || 'Failed to update product',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await productsService.deleteProduct(id);
      return res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      if (err.message === 'ERR_PRODUCT_NOT_FOUND') {
        return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND', message: 'Product not found' });
      }
      console.error('delete product failed:', err);
      return res.status(500).json({ error: 'ERR_DELETE_PRODUCT_FAILED', message: 'Failed to delete product' });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { productIds } = req.body || {};
      console.log('[PRODUCTS][BULK_DELETE] ========================================');
      console.log('[PRODUCTS][BULK_DELETE] Full request body:', JSON.stringify(req.body, null, 2));
      console.log('[PRODUCTS][BULK_DELETE] Received', productIds?.length || 0, 'product IDs to delete');
      console.log('[PRODUCTS][BULK_DELETE] Product IDs:', JSON.stringify(productIds, null, 2));
      const result = await productsService.bulkDeleteProducts(productIds || []);
      console.log('[PRODUCTS][BULK_DELETE] Result:', {
        successCount: result.successCount,
        failedCount: result.failedCount
      });
      console.log('[PRODUCTS][BULK_DELETE] ========================================');
      return res.json({
        success: true,
        message: `Deleted ${result.successCount} product(s), ${result.failedCount} failed`,
        data: result
      });
    } catch (err) {
      console.error('[PRODUCTS][BULK_DELETE] ========================================');
      console.error('[PRODUCTS][BULK_DELETE] Error:', err.message);
      console.error('[PRODUCTS][BULK_DELETE] Stack:', err.stack);
      console.error('[PRODUCTS][BULK_DELETE] ========================================');
      return res.status(500).json({
        error: 'ERR_BULK_DELETE_PRODUCTS_FAILED',
        message: 'Failed to bulk delete products'
      });
    }
  }

  async getTags(req, res) {
    try {
      console.log('[getTags] Called with URL:', req.originalUrl || req.url);
      const tags = await productsService.getAllTags();
      console.log('[getTags] Success, returning', tags.length, 'tags');
      return res.json({ success: true, data: { tags } });
    } catch (err) {
      if (err.message === 'ERR_GET_TAGS_FAILED') {
        return res.status(500).json({ error: 'ERR_GET_TAGS_FAILED', message: 'Failed to get tags' });
      }
      console.error('get tags failed:', err);
      return res.status(500).json({ error: 'ERR_GET_TAGS_FAILED', message: 'Failed to get tags' });
    }
  }

  async getCategories(req, res) {
    try {
      console.log('[getCategories] Called with URL:', req.originalUrl || req.url);
      const categories = await productsService.getAllCategories();
      console.log('[getCategories] Success, returning', categories.length, 'categories');
      return res.json({ success: true, data: { categories } });
    } catch (err) {
      if (err.message === 'ERR_GET_CATEGORIES_FAILED') {
        return res.status(500).json({ error: 'ERR_GET_CATEGORIES_FAILED', message: 'Failed to get categories' });
      }
      console.error('get categories failed:', err);
      return res.status(500).json({ error: 'ERR_GET_CATEGORIES_FAILED', message: 'Failed to get categories' });
    }
  }
}

module.exports = new ProductsController();








