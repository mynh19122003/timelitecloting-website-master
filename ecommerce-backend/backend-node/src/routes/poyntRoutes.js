const express = require('express');
const poyntController = require('../controllers/poyntController');

const router = express.Router();

// Public endpoint for PHP backend to call (NO auth required)
// PHP backend will validate requests before calling this
router.post('/charge-card', poyntController.chargeCard);

module.exports = router;
