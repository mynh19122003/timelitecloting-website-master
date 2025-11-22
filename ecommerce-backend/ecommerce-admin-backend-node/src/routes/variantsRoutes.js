const express = require('express');
const router = express.Router();
const variantsController = require('../controllers/variantsController');
const { validate, variantCreateSchema } = require('../middleware/validation');

router.get('/', variantsController.list);
router.post('/', validate(variantCreateSchema), variantsController.create);

module.exports = router;

