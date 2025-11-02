const productService = require('../services/productService');

class ProductController {
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      
      const result = await productService.getProducts(
        parseInt(page),
        parseInt(limit),
        search,
        sortBy,
        sortOrder
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        error: 'ERR_GET_PRODUCTS_FAILED',
        message: 'Failed to get products'
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(parseInt(id));
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      if (error.message === 'ERR_PRODUCT_NOT_FOUND') {
        return res.status(404).json({
          error: 'ERR_PRODUCT_NOT_FOUND',
          message: 'Product not found'
        });
      }
      
      res.status(500).json({
        error: 'ERR_GET_PRODUCT_FAILED',
        message: 'Failed to get product'
      });
    }
  }
}

module.exports = new ProductController();
