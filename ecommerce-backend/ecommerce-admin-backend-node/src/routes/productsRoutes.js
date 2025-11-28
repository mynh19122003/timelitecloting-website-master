const express = require('express');
const productsController = require('../controllers/productsController');
const {
  validate,
  productCreateSchema,
  productUpdateSchema,
  bulkProductCreateSchema,
  bulkProductDeleteSchema
} = require('../middleware/validation');

const router = express.Router();

// List products
router.get('/', productsController.list);

// Get all tags - MUST be before /:id route to avoid conflict
// Using explicit path to ensure it's matched before parameterized routes
router.get('/tags', (req, res, next) => {
  console.log('[ROUTE] /tags matched, calling getTags controller');
  productsController.getTags(req, res, next);
});

// Get all categories - MUST be before /:id route to avoid conflict
router.get('/categories', (req, res, next) => {
  console.log('[ROUTE] /categories matched, calling getCategories controller');
  productsController.getCategories(req, res, next);
});

// Create (upload) new product
router.post('/', validate(productCreateSchema), productsController.create);

// Bulk create products - MUST be before /:id route to avoid conflict
router.post('/bulk', validate(bulkProductCreateSchema), productsController.bulkCreate);

// Bulk delete products - MUST be before /:id route to avoid conflict
router.delete('/bulk', validate(bulkProductDeleteSchema), productsController.bulkDelete);

// Get product detail by products_id (PID...) hoặc id số
// This route must be after /tags to avoid conflict
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  console.log('[ROUTE] /:id matched with id:', id);
  // Double check to prevent "tags" from being matched (shouldn't happen if routes are ordered correctly)
  if (id === 'tags') {
    console.log('[ROUTE] WARNING: /tags was matched by /:id route! This should not happen.');
    return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Endpoint not found' });
  }
  productsController.get(req, res, next);
});

// Update product
router.patch('/:id', validate(productUpdateSchema), productsController.update);

// Delete product
router.delete('/:id', productsController.delete);

module.exports = router;





