const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, shouldSkipDb } = require('./config/database');
const conversationsService = require('./services/conversationsService');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/authRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const customersRoutes = require('./routes/customersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const conversationsRoutes = require('./routes/conversationsRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.ADMIN_NODE_PORT || 3001;

const isProduction = process.env.NODE_ENV === 'production'
const prodAllowList = ['https://yourdomain.com']

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (isProduction) {
      return callback(null, prodAllowList.includes(origin))
    }
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

if (!isProduction) {
  app.use((req, res, next) => {
    const reqOrigin = req.headers.origin
    if (reqOrigin) {
      res.setHeader('Access-Control-Allow-Origin', reqOrigin)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
      const requested = req.headers['access-control-request-headers']
      res.setHeader('Access-Control-Allow-Headers', requested || 'Content-Type, Authorization, Accept, X-Requested-With')
      if (req.method === 'OPTIONS') {
        return res.status(200).end()
      }
    }
    return next()
  })
}

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'ERR_RATE_LIMIT_EXCEEDED', message: 'Too many requests, try later.' }
});
const DISABLE_RATE_LIMIT = String(process.env.DISABLE_RATE_LIMIT || '').toLowerCase() === 'true' 
  || process.env.DISABLE_RATE_LIMIT === '1';
if (!DISABLE_RATE_LIMIT) {
  app.use(limiter);
} else {
  console.warn('⚠️  Rate limit is DISABLED via DISABLE_RATE_LIMIT env (testing mode).');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const MEDIA_ROOT = process.env.MEDIA_ROOT || '/data/admindata/picture';
app.use('/admin/media', express.static(MEDIA_ROOT, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  setHeaders: (res) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const cache = process.env.NODE_ENV === 'production'
        ? 'public, max-age=2592000, immutable'
        : 'no-cache';
      res.setHeader('Cache-Control', cache);
    } catch (_) { /* ignore */ }
  }
}));

if (!isProduction) {
  app.use((req, res, next) => {
    try {
      console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    } catch (_) {}
    next();
  });
}

const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;
const DISABLE_ADMIN_TOKEN = String(process.env.DISABLE_ADMIN_TOKEN || '').toLowerCase() === 'true'
  || process.env.DISABLE_ADMIN_TOKEN === '1';
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const url = req.originalUrl || '';
  if (!url.startsWith('/admin/')) return next();
  if (url.startsWith('/admin/auth')) return next();

  if (DISABLE_ADMIN_TOKEN) {
    try {
      console.log(`[AUTH] Skipped (DISABLE_ADMIN_TOKEN=1) method=${req.method} url=${req.originalUrl}`);
    } catch (_) {}
    return next();
  }

  if (!ADMIN_API_TOKEN) {
    try {
      console.warn('[AUTH] Missing ADMIN_API_TOKEN in env; rejecting auth');
    } catch (_) {}
    return res.status(503).json({ error: 'ERR_AUTH_NOT_CONFIGURED', message: 'Admin token not configured' });
  }

  const authHeader = req.headers.authorization || '';
  const headerLower = typeof authHeader === 'string' ? authHeader.toLowerCase() : '';
  let token = '';
  if (headerLower.startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']);
  }

  if (!token) {
    try {
      console.warn(`[AUTH] Missing token for POST ${req.originalUrl}`, {
        hasAuthHeader: Boolean(req.headers.authorization),
        hasXAdminToken: Boolean(req.headers['x-admin-token']),
        contentType: req.headers['content-type']
      });
    } catch (_) {}
    return res.status(401).json({ error: 'ERR_UNAUTHORIZED', message: 'Missing admin token' });
  }
  if (token !== ADMIN_API_TOKEN) {
    try {
      console.warn(`[AUTH] Invalid token for POST ${req.originalUrl}`, {
        providedLength: token ? token.length : 0,
        expectedLength: ADMIN_API_TOKEN.length,
        headerType: headerLower.startsWith('bearer ') ? 'Authorization: Bearer' : (req.headers['x-admin-token'] ? 'X-Admin-Token' : 'unknown')
      });
    } catch (_) {}
    return res.status(403).json({ error: 'ERR_FORBIDDEN', message: 'Invalid admin token' });
  }
  try {
    console.log(`[AUTH] OK method=${req.method} url=${req.originalUrl}`);
  } catch (_) {}
  return next();
});

app.get('/admin/health', (req, res) => {
  res.json({ status: 'OK', service: 'admin-backend-node', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use('/admin/auth', authRoutes);
app.use('/admin/orders', ordersRoutes);
app.use('/admin/customers', customersRoutes);
app.use('/admin/products', productsRoutes);
app.use('/admin/conversations', conversationsRoutes);

app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
  });
  res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  logger.logApiError(req, err.status || 500, err, {
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error: err.code || err.error || 'ERR_INTERNAL_SERVER_ERROR',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const start = async () => {
  try {
    await testConnection();
    server.listen(PORT, () => {
      console.log(`🚀 Admin backend on ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/admin/health`);
      if (shouldSkipDb) {
        console.warn('⚠️  Chế độ dev SKIP_DB=1 đang bật, các API cần DB có thể lỗi.');
      }
    });
  } catch (e) {
    console.error('Failed starting admin backend:', e);
    process.exit(1);
  }
};

start();

module.exports = app;
module.exports.server = server;


