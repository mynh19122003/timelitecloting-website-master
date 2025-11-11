const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { io: clientIo } = require('socket.io-client');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, shouldSkipDb } = require('./config/database');
const conversationsService = require('./services/conversationsService');

// Routes
const authRoutes = require('./routes/authRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const customersRoutes = require('./routes/customersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const conversationsRoutes = require('./routes/conversationsRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.ADMIN_NODE_PORT || 3001;

// CORS (dev: cho phép mọi origin; prod: whitelist cụ thể)
const isProduction = process.env.NODE_ENV === 'production'
const prodAllowList = ['https://yourdomain.com']

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép luôn khi không có header Origin (same-origin, tools)
    if (!origin) return callback(null, true)
    if (isProduction) {
      return callback(null, prodAllowList.includes(origin))
    }
    // Dev: phản chiếu lại origin yêu cầu (cho phép http://localhost:* v.v.)
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Extra dev CORS safeguard: explicitly mirror Origin and handle OPTIONS
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

// Security (after CORS so headers are not stripped)
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'ERR_RATE_LIMIT_EXCEEDED', message: 'Too many requests, try later.' }
});
// Allow disabling rate limit temporarily via env for testing
const DISABLE_RATE_LIMIT = String(process.env.DISABLE_RATE_LIMIT || '').toLowerCase() === 'true' 
  || process.env.DISABLE_RATE_LIMIT === '1';
if (!DISABLE_RATE_LIMIT) {
  app.use(limiter);
} else {
  console.warn('⚠️  Rate limit is DISABLED via DISABLE_RATE_LIMIT env (testing mode).');
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve product images from MEDIA_ROOT (stored by productsService)
const MEDIA_ROOT = process.env.MEDIA_ROOT || '/data/admindata/picture';
app.use('/admin/media', express.static(MEDIA_ROOT, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  setHeaders: (res) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      // Allow embedding images from other origins (fixes CORP blocking in UI)
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const cache = process.env.NODE_ENV === 'production'
        ? 'public, max-age=2592000, immutable'
        : 'no-cache';
      res.setHeader('Cache-Control', cache);
    } catch (_) { /* ignore */ }
  }
}));

// Simple request logger for debugging (dev only)
if (!isProduction) {
  app.use((req, res, next) => {
    try {
      console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    } catch (_) {}
    next();
  });
}

// Admin token auth for POST requests
// Requires Authorization: Bearer <ADMIN_API_TOKEN> or X-Admin-Token header
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;
const DISABLE_ADMIN_TOKEN = String(process.env.DISABLE_ADMIN_TOKEN || '').toLowerCase() === 'true'
  || process.env.DISABLE_ADMIN_TOKEN === '1';
app.use((req, res, next) => {
  // Only enforce for POST under /admin, excluding /admin/auth/* (e.g., login)
  if (req.method !== 'POST') return next();
  const url = req.originalUrl || '';
  if (!url.startsWith('/admin/')) return next();
  if (url.startsWith('/admin/auth')) return next();

  if (DISABLE_ADMIN_TOKEN) {
    // Bỏ qua kiểm tra token khi bật DISABLE_ADMIN_TOKEN (phục vụ dev/test, không dùng production)
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

// Health
app.get('/admin/health', (req, res) => {
  res.json({ status: 'OK', service: 'admin-backend-node', version: '1.0.0', timestamp: new Date().toISOString() });
});

// API routes
app.use('/admin/auth', authRoutes);
app.use('/admin/orders', ordersRoutes);
app.use('/admin/customers', customersRoutes);
app.use('/admin/products', productsRoutes);
app.use('/admin/conversations', conversationsRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Admin API error:', err);
  res.status(500).json({ error: 'ERR_INTERNAL_SERVER_ERROR', message: 'Internal server error' });
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Same CORS logic as Express app
      if (!origin) return callback(null, true);
      if (isProduction) {
        return callback(null, prodAllowList.includes(origin));
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  allowEIO3: true
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Admin connected: ${socket.id}`);

  // Join admin room
  socket.on('admin:join', (data) => {
    const { adminId, name } = data || {};
    if (adminId) {
      socket.join(`admin:${adminId}`);
      socket.adminId = adminId;
      socket.adminName = name || 'Admin';
      console.log(`📌 Admin ${adminId} (${socket.adminName}) joined room`);
      socket.emit('admin:joined', { success: true });
    }
  });

  // Join conversation room (for receiving messages from customers)
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`💬 Admin ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`👋 Admin ${socket.id} left conversation ${conversationId}`);
  });

  // Send message from admin to customer
  socket.on('message:send', async (data) => {
    const { conversationId, message, customerId } = data || {};
    
    if (!conversationId || !message) {
      return socket.emit('message:error', { error: 'Missing conversationId or message' });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
      conversationId,
      from: 'admin',
      adminId: socket.adminId || 'unknown',
      adminName: socket.adminName || 'Admin',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      customerId
    };

    // Save message to database
    try {
      if (!shouldSkipDb) {
        // Extract user_id from customerId (format: customer-{userId})
        const userId = customerId ? parseInt(customerId.replace('customer-', '')) : null;
        
        // Always save admin message to database, even without userId
        // Try to get or create conversation first
        try {
          if (userId) {
            await conversationsService.upsertConversation(conversationId, userId);
          } else {
            // For guest users or new conversations, create conversation without userId
            await conversationsService.upsertConversation(conversationId, null, null, null);
          }
        } catch (convError) {
          console.warn('Conversation upsert warning (may not exist yet):', convError.message);
          // Continue - message will still be saved
        }
        
        // Save message regardless of userId
        await conversationsService.saveMessage({
          messageId,
          conversationId,
          fromType: 'admin',
          fromId: socket.adminId || 'unknown',
          fromName: socket.adminName || 'Admin',
          message: message.trim()
        });
        
        console.log(`💾 Saved admin message to database: ${messageId} in conversation ${conversationId}`);
      }
    } catch (error) {
      console.error('Failed to save message to database:', error);
      // Continue even if DB save fails - message still sent via socket
    }

    // Forward message to client socket server (port 3001)
    if (clientSocket?.connected && customerId) {
      clientSocket.emit('message:admin', {
        ...messageData,
        customerId
      });
      console.log(`📤 Forwarded admin message to client socket server for customer ${customerId}`);
    }

    // Broadcast to customer room (if customer connected to admin socket)
    if (customerId) {
      io.to(`customer:${customerId}`).emit('message:new', messageData);
    }

    // Also broadcast to conversation room (for other admins)
    io.to(`conversation:${conversationId}`).emit('message:new', messageData);

    // Confirm to sender
    socket.emit('message:sent', messageData);
    console.log(`📤 Admin ${socket.adminId} sent message to conversation ${conversationId}`);
  });

  // Receive message from customer
  socket.on('message:received', async (data) => {
    // Forward to conversation room
    if (data.conversationId) {
      io.to(`conversation:${data.conversationId}`).emit('message:new', data);
      
      // Save customer message to database
      try {
        if (!shouldSkipDb && data.from === 'customer') {
          const userId = data.customerId ? parseInt(data.customerId.replace('customer-', '')) : null;
          
          // Always save customer message, even without userId
          try {
            await conversationsService.upsertConversation(
              data.conversationId, 
              userId,
              data.customerName || null,
              data.customerEmail || null
            );
          } catch (convError) {
            console.warn('Conversation upsert warning:', convError.message);
          }
          
          await conversationsService.saveMessage({
            messageId: data.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId: data.conversationId,
            fromType: 'customer',
            fromId: data.customerId || null,
            fromName: data.customerName || 'Customer',
            message: data.message || data.text || ''
          });
          
          console.log(`💾 Saved customer message (via message:received) to database`);
        }
      } catch (error) {
        console.error('Failed to save customer message to database:', error);
        // Continue even if DB save fails
      }
    }
  });

  // Typing indicator
  socket.on('typing:start', (data) => {
    const { conversationId, customerId } = data || {};
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit('typing:admin', {
        adminId: socket.adminId,
        adminName: socket.adminName,
        conversationId
      });
      if (customerId) {
        socket.to(`customer:${customerId}`).emit('typing:admin', {
          adminId: socket.adminId,
          adminName: socket.adminName,
          conversationId
        });
        // Forward typing indicator to client socket server
        if (clientSocket?.connected) {
          clientSocket.emit('typing:admin', {
            adminId: socket.adminId,
            adminName: socket.adminName,
            conversationId,
            customerId
          });
        }
      }
    }
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, customerId } = data || {};
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit('typing:admin:stop', {
        adminId: socket.adminId,
        conversationId
      });
      if (customerId) {
        socket.to(`customer:${customerId}`).emit('typing:admin:stop', {
          adminId: socket.adminId,
          conversationId
        });
        // Forward typing stop to client socket server
        if (clientSocket?.connected) {
          clientSocket.emit('typing:admin:stop', {
            adminId: socket.adminId,
            conversationId,
            customerId
          });
        }
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Admin disconnected: ${socket.id}`);
  });
});

// Make io available to routes if needed
app.set('io', io);

// Connect to client socket server (port 3001) for message forwarding
const CLIENT_SOCKET_URL = process.env.CLIENT_SOCKET_URL || 'http://localhost:3001';
let clientSocket = null;

// Try to connect to client socket server
const connectToClientSocket = () => {
  try {
    console.log(`🔗 Connecting to client socket server: ${CLIENT_SOCKET_URL}`);
    
    clientSocket = clientIo(CLIENT_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      autoConnect: true
    });

    clientSocket.on('connect', () => {
      console.log(`✅ Connected to client socket server: ${clientSocket.id}`);
    });

    clientSocket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected from client socket server: ${reason}`);
    });

    clientSocket.on('connect_error', (error) => {
      console.error(`⚠️  Failed to connect to client socket server:`, error.message);
      console.log(`💡 Note: Client socket server may not be running. Admin chat will still work internally.`);
    });

    // Listen for messages from customers and forward to admin
    clientSocket.on('message:customer', async (data) => {
      // Forward to admin conversation room
      if (data.conversationId) {
        io.to(`conversation:${data.conversationId}`).emit('message:new', {
          ...data,
          from: 'customer'
        });
        console.log(`📥 Forwarded customer message to conversation ${data.conversationId}`);
        
        // Save customer message to database
        try {
          if (!shouldSkipDb) {
            const userId = data.customerId ? parseInt(data.customerId.replace('customer-', '')) : null;
            
            // Always save customer message, even without userId
            try {
              await conversationsService.upsertConversation(
                data.conversationId, 
                userId, 
                data.customerName || null,
                data.customerEmail || null
              );
            } catch (convError) {
              console.warn('Conversation upsert warning:', convError.message);
            }
            
            // Save message regardless of userId
            await conversationsService.saveMessage({
              messageId: data.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              conversationId: data.conversationId,
              fromType: 'customer',
              fromId: data.customerId || null,
              fromName: data.customerName || 'Customer',
              message: data.message || data.text || ''
            });
            
            console.log(`💾 Saved customer message to database in conversation ${data.conversationId}`);
          }
        } catch (error) {
          console.error('Failed to save customer message to database:', error);
          // Continue even if DB save fails
        }
      }
    });

    // Listen for customer typing
    clientSocket.on('typing:customer', (data) => {
      if (data.conversationId) {
        io.to(`conversation:${data.conversationId}`).emit('typing:customer', data);
      }
    });

    clientSocket.on('typing:customer:stop', (data) => {
      if (data.conversationId) {
        io.to(`conversation:${data.conversationId}`).emit('typing:customer:stop', data);
      }
    });

  } catch (error) {
    console.error('Failed to setup client socket connection:', error);
  }
};

// Start connection to client socket server
connectToClientSocket();

const start = async () => {
  try {
    await testConnection();
    server.listen(PORT, () => {
      console.log(`🚀 Admin backend on ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/admin/health`);
      console.log(`💬 Socket.IO ready for admin connections`);
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
module.exports.io = io;


