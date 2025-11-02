const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { validate, orderSchema } = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Protected routes
router.post('/', validate(orderSchema), orderController.createOrder);
router.get('/history', orderController.getOrderHistory);
router.get('/:id', orderController.getOrderById);

module.exports = router;
