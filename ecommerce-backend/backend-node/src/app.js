const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Logger utility
const isDevelopment = process.env.NODE_ENV !== 'production';
const logger = {
  formatLog: (level, message, data = {}) => ({
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
    pid: process.pid,
    ...data,
  }),
  log: (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    switch (level) {
      case 'ERROR':
        console.error(prefix, message, data);
        if (isDevelopment && data.stack) console.error('Stack trace:', data.stack);
        break;
      case 'WARN':
        console.warn(prefix, message, data);
        break;
      case 'INFO':
        console.log(prefix, message, data);
        break;
      case 'DEBUG':
        if (isDevelopment) console.debug(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  },
  debug: (message, data) => logger.log('DEBUG', message, data),
  info: (message, data) => logger.log('INFO', message, data),
  warn: (message, data) => logger.log('WARN', message, data),
  error: (message, error, data = {}) => {
    const errorData = {
      ...data,
      message: error?.message || message,
      stack: error?.stack,
      name: error?.name,
    };
    logger.log('ERROR', message, errorData);
  },
  logApiError: (req, status, error, additionalData = {}) => {
    const errorData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      ...additionalData,
    };
    if (error instanceof Error) {
      errorData.errorMessage = error.message;
      errorData.errorStack = error.stack;
      errorData.errorName = error.name;
    } else {
      errorData.error = error;
    }
    logger.error(`API Error: ${req.method} ${req.originalUrl || req.url}`, error instanceof Error ? error : new Error(String(error)), errorData);
  },
};

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.NODE_PORT || 3001;

// Default CORS origins for development: allow both frontend (3000) and admin panel (3002)
const defaultCorsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://timeliteclothing.com', 'https://www.timeliteclothing.com', 'https://api.timeliteclothing.com'] 
  : ['http://localhost:3000', 'http://localhost:3002'];

// Parse CORS_ORIGIN if provided (can be comma-separated string or single value)
const corsOrigin = process.env.CORS_ORIGIN 
  ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : process.env.CORS_ORIGIN)
  : defaultCorsOrigins;

// Security middleware
app.use(helmet());

// CORS configuration
// When running behind the API gateway, set ENABLE_NODE_CORS=false (default)
// to avoid duplicate CORS headers. Enable only for direct access in dev.
if (process.env.ENABLE_NODE_CORS === 'true') {
  app.use(cors({
    origin: corsOrigin,
    credentials: true
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'ERR_RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ecommerce-backend-node',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
  });
  res.status(404).json({
    error: 'ERR_NOT_FOUND',
    message: 'Không tìm thấy endpoint'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  // Log error with detailed information
  logger.logApiError(req, error.status || 500, error, {
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Determine status code
  const status = error.status || error.statusCode || 500;

  // Send error response
  res.status(status).json({
    error: error.code || error.error || 'ERR_INTERNAL_SERVER_ERROR',
    message: error.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    server.listen(PORT, () => {
      console.log(`🚀 Node.js backend server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
