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
  // Optional
  total_amount: Joi.number().positive().max(1000000).optional(),
  notes: Joi.string().max(2000).allow('').optional()
});

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
