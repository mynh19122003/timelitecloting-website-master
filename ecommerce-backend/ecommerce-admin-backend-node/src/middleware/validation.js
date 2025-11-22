const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().max(255).optional()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: 'ERR_VALIDATION_FAILED', message: error.details[0].message });
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) return res.status(400).json({ error: 'ERR_VALIDATION_FAILED', message: error.details[0].message });
  next();
};

// Orders
const ordersListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().trim().optional(),
  order_id: Joi.string().trim().optional()
});

const orderStatusUpdateSchema = Joi.object({
  status: Joi.string().trim().min(1).max(50).required()
});

// Customers
const customersListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().trim().allow('', null).optional()
});

// Accept both flat fields and a nested address object
const customerUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  first_name: Joi.string().max(255).optional(),
  last_name: Joi.string().max(255).optional(),
  user_name: Joi.string().max(255).optional(), // direct override if provided
  phone: Joi.string().max(32).optional(),
  street_address: Joi.string().max(500).optional(),
  city: Joi.string().max(255).optional(),
  state: Joi.string().max(64).optional(),
  postal_code: Joi.string().max(32).optional(),
  address: Joi.object({
    street: Joi.string().max(500).optional(),
    city: Joi.string().max(255).optional(),
    state: Joi.string().max(64).optional(),
    postal_code: Joi.string().max(32).optional()
  }).optional()
}).min(1);

// Products
const productCreateSchema = Joi.object({
  products_id: Joi.string()
    .pattern(/^PID\d{3,}$/i, 'PID format')
    .optional(),
  name: Joi.string().max(255).required(),
  price: Joi.number().required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().allow('', null).optional(),
  image_url: Joi.string().allow('', null).optional(), // base64 của ảnh chính
  slug: Joi.string().max(255).allow('', null).optional(),
  category: Joi.string().max(64).allow('', null).optional(),
  variant: Joi.string().max(128).allow('', null).optional(),
  short_description: Joi.string().allow('', null).optional(),
  original_price: Joi.number().allow(null).optional(),
  colors: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array()).optional(),
  sizes: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array()).optional(),
  gallery: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(), // mảng base64 hoặc JSON string
  rating: Joi.number().allow(null).optional(),
  reviews: Joi.number().integer().allow(null).optional(),
  tags: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional(),
  is_featured: Joi.number().valid(0,1).optional(),
  is_new: Joi.number().valid(0,1).optional()
});

const productUpdateSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  price: Joi.number().optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().allow('', null).optional(),
  image_url: Joi.string().allow('', null).optional(),
  slug: Joi.string().max(255).allow('', null).optional(),
  category: Joi.string().max(64).allow('', null).optional(),
  variant: Joi.string().max(128).allow('', null).optional(),
  short_description: Joi.string().allow('', null).optional(),
  original_price: Joi.number().allow(null).optional(),
  colors: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array()).optional(),
  sizes: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array()).optional(),
  gallery: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  rating: Joi.number().allow(null).optional(),
  reviews: Joi.number().integer().allow(null).optional(),
  tags: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional(),
  is_featured: Joi.number().valid(0,1).optional(),
  is_new: Joi.number().valid(0,1).optional()
}).min(1);

const variantCreateSchema = Joi.object({
  variant_name: Joi.string().max(128).required()
});

module.exports = { validate, validateQuery, loginSchema, changePasswordSchema, updateProfileSchema, ordersListSchema, orderStatusUpdateSchema, customersListSchema, customerUpdateSchema, productCreateSchema, productUpdateSchema, variantCreateSchema };


