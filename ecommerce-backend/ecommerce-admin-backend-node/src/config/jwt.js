const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'change-me-admin-secret';
const JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '8h';

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' });
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
const decodeToken = (token) => jwt.decode(token);

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, generateToken, verifyToken, decodeToken };


