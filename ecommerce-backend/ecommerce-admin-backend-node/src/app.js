const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, shouldSkipDb } = require('./config/database');
const conversationsService = require('./services/conversationsService');
const logger = require('./utils/logger');
const { buildPayloadPreview } = require('./utils/payloadPreview');

// Routes
const authRoutes = require('./routes/authRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const customersRoutes = require('./routes/customersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const variantsRoutes = require('./routes/variantsRoutes');
const conversationsRoutes = require('./routes/conversationsRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.ADMIN_NODE_PORT || 3001;

const isProduction = process.env.NODE_ENV === 'production'
const prodAllowList = ['https://api.timeliteclothing.com', 'https://timeliteclothing.com', 'https://www.timeliteclothing.com']

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // In production, only allow whitelisted origins
    if (isProduction) {
      // Check if origin matches any allowed pattern
      const isAllowed = prodAllowList.some(allowed => {
        if (allowed === origin) return true
        // Support subdomain matching
        try {
          const originUrl = new URL(origin)
          const allowedUrl = new URL(allowed)
          return originUrl.hostname === allowedUrl.hostname || 
                 originUrl.hostname.endsWith('.' + allowedUrl.hostname)
        } catch {
          return false
        }
      })
      return callback(null, isAllowed)
    }
    
    // In development, allow all origins for easier local development
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Admin-Token'],
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

// Admin API token middleware: Accept JWT token from login
// The JWT token is returned from /admin/auth/login and used for POST requests to /admin/* endpoints
const { verifyToken } = require('./config/jwt');
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

  const authHeader = req.headers.authorization || '';
  const headerLower = typeof authHeader === 'string' ? authHeader.toLowerCase() : '';
  let token = '';
  if (headerLower.startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']);
  }

  const buildDebugPayload = () => {
    try {
      return buildPayloadPreview(req.body, { stringLimit: 256 })
    } catch (err) {
      return `payload_preview_failed: ${err.message}`
    }
  }

  const headerSnapshot = {
    hasAuthHeader: Boolean(req.headers.authorization),
    hasXAdminToken: Boolean(req.headers['x-admin-token']),
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length']
  }

  if (!token) {
    try {
      console.warn(`[AUTH] Missing token for POST ${req.originalUrl}`, {
        ...headerSnapshot,
        bodyPreview: buildDebugPayload()
      });
    } catch (_) {}
    return res.status(401).json({ error: 'ERR_UNAUTHORIZED', message: 'Missing admin token' });
  }
  
  // Verify JWT token instead of comparing with static token
  try {
    const decoded = verifyToken(token);
    // Token is valid JWT, allow request
    req.admin = decoded; // Store decoded token for potential use in routes
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] ✅ Valid JWT token for POST ${req.originalUrl}`, {
        adminId: decoded.adminId,
        email: decoded.email
      });
    }
    return next();
  } catch (err) {
    // JWT verification failed
    try {
      console.warn(`[AUTH] Invalid JWT token for POST ${req.originalUrl}`, {
        error: err.message,
        tokenLength: token ? token.length : 0,
        headerType: headerLower.startsWith('bearer ') ? 'Authorization: Bearer' : (req.headers['x-admin-token'] ? 'X-Admin-Token' : 'unknown'),
        ...headerSnapshot,
        bodyPreview: buildDebugPayload()
      });
    } catch (_) {}
    return res.status(403).json({ error: 'ERR_FORBIDDEN', message: 'Invalid admin token' });
  }
});

app.get('/admin/health', (req, res) => {
  res.json({ status: 'OK', service: 'admin-backend-node', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Gateway health check endpoint (proxied from nginx /health)
app.get('/gateway/health', (req, res) => {
  res.json({ status: 'OK', service: 'gateway-nginx', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use('/admin/auth', authRoutes);
app.use('/admin/orders', ordersRoutes);
app.use('/admin/customers', customersRoutes);
app.use('/admin/products', productsRoutes);
app.use('/admin/variants', variantsRoutes);
app.use('/admin/conversations', conversationsRoutes);

app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
  });
  res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Không tìm thấy endpoint' });
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
    message: err.message || 'Lỗi máy chủ nội bộ',
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


