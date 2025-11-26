const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validate, contactSchema } = require('../middleware/validation');

router.post('/', validate(contactSchema), contactController.submitInquiry);

module.exports = router;



