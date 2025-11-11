const express = require('express');
const usersController = require('../controllers/usersController');
const { validate, validateQuery, customersListSchema, customerUpdateSchema } = require('../middleware/validation');

const router = express.Router();

// For quick mount verification
router.get('/__debug', (req, res) => res.json({ ok: true }));

// List customers
router.get('/', validateQuery(customersListSchema), usersController.listGet);
router.post('/list', validate(customersListSchema), usersController.list);

// Get a customer by id/user_code/email
router.get('/:id', usersController.getByParam);

// Update customer
router.patch('/:id', validate(customerUpdateSchema), usersController.update);

module.exports = router;


