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

module.exports = {
  authenticateToken
};
