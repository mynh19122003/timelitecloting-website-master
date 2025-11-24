const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      products_id: Joi.string().max(32).optional(), // e.g., PID00001
      product_id: Joi.number().integer().positive().optional(),
      product_slug: Joi.string().max(255).optional(),
      quantity: Joi.number().integer().positive().max(99).required(),
      color: Joi.string().max(32).optional(),
      size: Joi.string().max(16).optional()
    }).custom((value, helpers) => {
      if (!value.products_id && !value.product_id && !value.product_slug) {
        return helpers.error('any.custom', { message: 'One of products_id, product_id, or product_slug is required' });
      }
      return value;
    }, 'product identifier validation')
  ).min(1).max(50).required(),
  // Customer info required
  firstname: Joi.string().max(100).required(),
  lastname: Joi.string().max(100).required(),
  address: Joi.string().max(500).required(),
  phonenumber: Joi.string().max(32).required(),
  payment_method: Joi.string().max(32).required(),
  // Optional customer info
  email: Joi.string().email().max(255).optional(),
  company: Joi.string().max(255).allow('').optional(),
  street_address: Joi.string().max(255).allow('').optional(),
  apartment: Joi.string().max(128).allow('').optional(),
  city: Joi.string().max(100).allow('').optional(),
  state: Joi.string().max(100).allow('').optional(),
  zip: Joi.string().max(20).allow('').optional(),
  country: Joi.string().max(100).allow('').optional(),
  // Shipping info
  shipping_method: Joi.string().max(64).allow('').optional(),
  shipping_cost: Joi.number().min(0).optional(),
  shipping_firstname: Joi.string().max(100).allow('').optional(),
  shipping_lastname: Joi.string().max(100).allow('').optional(),
  shipping_company: Joi.string().max(255).allow('').optional(),
  shipping_address: Joi.string().max(500).allow('').optional(),
  shipping_phone: Joi.string().max(32).allow('').optional(),
  // Billing info
  billing_firstname: Joi.string().max(100).allow('').optional(),
  billing_lastname: Joi.string().max(100).allow('').optional(),
  billing_company: Joi.string().max(255).allow('').optional(),
  billing_address: Joi.string().max(500).allow('').optional(),
  billing_phone: Joi.string().max(32).allow('').optional(),
  // Other optional fields
  total_amount: Joi.number().positive().optional(),
  notes: Joi.string().max(2000).allow('').optional()
}).unknown(false); // Explicitly disallow unknown fields to catch typos

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'ERR_VALIDATION_FAILED',
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  orderSchema
};
