const express = require('express');
const ordersController = require('../controllers/ordersController');
const { validate, validateQuery, ordersListSchema, orderStatusUpdateSchema } = require('../middleware/validation');

const router = express.Router();

// Quick debug route to verify router mount
router.get('/__debug', (req, res) => res.json({ ok: true }));

// List all orders (GET with query params)
router.get('/', validateQuery(ordersListSchema), ordersController.listGet);

// List all orders (POST with optional filters for ease in Postman testing)
router.post('/list', validate(ordersListSchema), ordersController.list);

// Get details by order_id (default route uses order_id for safety)
router.get('/:id', ordersController.getByOrderId);

// Removed separate by-order-id route; default ":id" now means "order_id"

// Update order status
router.patch('/:id/status', validate(orderStatusUpdateSchema), ordersController.updateStatus);

module.exports = router;



