const variantsService = require('../services/variantsService');

class VariantsController {
  async list(req, res) {
    try {
      const { category } = req.query || {};
      const items = await variantsService.listVariants({ category });
      res.json({ success: true, data: items });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { variant_name, category_slug } = req.body;
      const result = await variantsService.createVariant(variant_name, category_slug);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new VariantsController();

