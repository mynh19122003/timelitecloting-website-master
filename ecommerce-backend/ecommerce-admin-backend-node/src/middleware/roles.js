const authorizeRoles = (...allowed) => (req, res, next) => {
  const role = req.admin && req.admin.role;
  if (!role) return res.status(401).json({ error: 'ERR_INVALID_TOKEN', message: 'Invalid token' });
  if (!allowed.includes(role)) return res.status(403).json({ error: 'ERR_FORBIDDEN', message: 'Insufficient permissions' });
  next();
};

module.exports = { authorizeRoles };


