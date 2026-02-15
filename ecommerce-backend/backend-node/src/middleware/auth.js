const { verifyToken } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  let token = null;

  // Check Authorization header first
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Fallback: check body field (not recommended)
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'ERR_MISSING_TOKEN',
      message: 'Token is required'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'ERR_INVALID_TOKEN',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication middleware for guest checkout support
 * Sets req.user if token is valid, otherwise allows request to proceed
 * Controller should check req.user to determine if user is authenticated
 */
const optionalAuth = (req, res, next) => {
  let token = null;

  // Check Authorization header first
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Fallback: check body field (not recommended)
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }

  // If no token, allow guest access (set req.user to null)
  if (!token) {
    req.user = null;
    return next();
  }

  // If token exists, verify it
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Invalid token - still allow request but as guest
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
