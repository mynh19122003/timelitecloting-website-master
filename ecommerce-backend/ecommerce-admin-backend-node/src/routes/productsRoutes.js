const express = require('express');
const productsController = require('../controllers/productsController');
const { validate, productCreateSchema, productUpdateSchema } = require('../middleware/validation');

const router = express.Router();

// List products
router.get('/', productsController.list);

// Create (upload) new product
router.post('/', validate(productCreateSchema), productsController.create);

// Get product detail by products_id (PID...) hoặc id số
router.get('/:id', productsController.get);

// Update product
router.patch('/:id', validate(productUpdateSchema), productsController.update);

// Delete product
router.delete('/:id', productsController.delete);

module.exports = router;





