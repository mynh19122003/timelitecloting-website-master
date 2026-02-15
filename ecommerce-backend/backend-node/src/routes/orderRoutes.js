const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, orderSchema } = require('../middleware/validation');

const router = express.Router();

// createOrder supports both authenticated users AND guest checkout
router.post('/', optionalAuth, validate(orderSchema), orderController.createOrder);

// All other order routes require authentication
router.get('/history', authenticateToken, orderController.getOrderHistory);
router.get('/:id', authenticateToken, orderController.getOrderById);

module.exports = router;
