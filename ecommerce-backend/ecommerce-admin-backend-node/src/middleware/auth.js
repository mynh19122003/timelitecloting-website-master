const { verifyToken } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({ error: 'ERR_MISSING_TOKEN', message: 'Token is required' });
  }
  try {
    const decoded = verifyToken(token);
    req.admin = decoded;
    next();
  } catch (e) {
    // Log error for debugging (in development)
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth Middleware] Token verification failed:', e.message);
    }
    return res.status(401).json({ error: 'ERR_INVALID_TOKEN', message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };


