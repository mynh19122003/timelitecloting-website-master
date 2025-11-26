const express = require('express');
const router = express.Router();
const variantsController = require('../controllers/variantsController');
const { validate, validateQuery, variantCreateSchema, variantListQuerySchema } = require('../middleware/validation');

router.get('/', validateQuery(variantListQuerySchema), variantsController.list);
router.post('/', validate(variantCreateSchema), variantsController.create);

module.exports = router;

