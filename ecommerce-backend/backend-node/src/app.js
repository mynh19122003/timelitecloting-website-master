const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { verifyToken } = require('./config/jwt');
const chatService = require('./services/chatService');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.NODE_PORT || 3001;

// Initialize Socket.IO
// Default CORS origins for development: allow both frontend (3000) and admin panel (3002)
const defaultCorsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://yourdomain.com'] 
  : ['http://localhost:3000', 'http://localhost:3002'];

// Parse CORS_ORIGIN if provided (can be comma-separated string or single value)
const corsOrigin = process.env.CORS_ORIGIN 
  ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : process.env.CORS_ORIGIN)
  : defaultCorsOrigins;

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true // Support older Socket.IO clients
});

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
  res.status(404).json({
    error: 'ERR_NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    error: 'ERR_INTERNAL_SERVER_ERROR',
    message: 'Internal server error'
  });
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        socket.userName = decoded.userName || decoded.name || 'User';
      } catch (error) {
        // Token invalid, allow as guest
        console.log('Socket connection without valid token, connecting as guest');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  const sessionId = socket.id;
  const userId = socket.userId || null;
  const userEmail = socket.userEmail || socket.handshake.auth?.email || null;
  const userName = socket.userName || socket.handshake.auth?.name || 'Guest';

  console.log(`🔌 Socket.IO client connected: ${sessionId}`, { userId, userEmail, userName });

  // Create or update session
  await chatService.createOrUpdateSession({
    sessionId,
    userId,
    userEmail,
    userName
  });

  // Send connection success
  socket.emit('connected', {
    message: 'Connected to chat server',
    sessionId,
    userId,
    userEmail,
    userName
  });

  // Load and send message history
  try {
    const history = await chatService.getMessageHistory(userId, 50);
    socket.emit('messageHistory', history);
  } catch (error) {
    console.error('Error loading message history:', error);
  }

  // Auto-join admin room if connecting from admin panel or has admin flag
  const origin = socket.handshake.headers?.origin || socket.handshake.headers?.referer || '';
  const isAdminPanel = origin.includes('3002') || 
                       socket.handshake.auth?.isAdmin === true ||
                       socket.handshake.auth?.role === 'admin' ||
                       socket.handshake.query?.isAdmin === 'true';
  
  console.log(`🔍 Connection check for ${sessionId}:`, { origin, isAdmin: isAdminPanel, auth: socket.handshake.auth });
  
  if (isAdminPanel) {
    socket.join('admin_room');
    console.log(`👨‍💼 Admin auto-joined admin room: ${sessionId}`);
    
    // Send all active sessions to admin
    try {
      const activeSessions = await chatService.getActiveSessions();
      socket.emit('activeSessions', activeSessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
    
    // Send all recent messages from all users
    try {
      const allMessages = await chatService.getAllMessages(100);
      socket.emit('allMessages', allMessages);
    } catch (error) {
      console.error('Error fetching all messages:', error);
    }
  }

  // Handle admin join room (for admin panel) - manual join
  socket.on('joinAdminRoom', async () => {
    socket.join('admin_room');
    console.log(`👨‍💼 Admin joined admin room: ${sessionId}`);
    
    // Send all active sessions to admin
    try {
      const activeSessions = await chatService.getActiveSessions();
      socket.emit('activeSessions', activeSessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
    
    // Send all recent messages from all users
    try {
      const allMessages = await chatService.getAllMessages(100);
      socket.emit('allMessages', allMessages);
    } catch (error) {
      console.error('Error fetching all messages:', error);
    }
  });

  // Handle admin request for all messages
  socket.on('getAllMessages', async () => {
    try {
      const allMessages = await chatService.getAllMessages(100);
      socket.emit('allMessages', allMessages);
    } catch (error) {
      console.error('Error fetching all messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });

  // Handle incoming messages
  socket.on('message', async (data) => {
    try {
      const { text } = data;
      
      if (!text || !text.trim()) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      // Save message to database
      const savedMessage = await chatService.saveMessage({
        userId,
        userEmail,
        userName,
        message: text.trim(),
        senderType: 'user'
      });

      // Echo back to sender
      socket.emit('message', {
        id: savedMessage.id,
        text: savedMessage.message,
        sender: 'user',
        userId,
        userEmail,
        userName,
        timestamp: savedMessage.createdAt
      });

      // Broadcast to admin room (admin panel)
      io.to('admin_room').emit('message', {
        id: savedMessage.id,
        text: savedMessage.message,
        sender: 'user',
        userId,
        userEmail,
        userName,
        timestamp: savedMessage.createdAt
      });

      console.log(`📨 Message received from ${userName}:`, text);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle admin messages (for future admin panel)
  socket.on('adminMessage', async (data) => {
    try {
      // Verify admin privileges (you can add admin check here)
      const { text, targetUserId, targetUserEmail } = data;
      
      if (!text || !text.trim()) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      // Save admin message
      const savedMessage = await chatService.saveMessage({
        userId: targetUserId,
        userEmail: targetUserEmail,
        userName: 'Admin',
        message: text.trim(),
        senderType: 'admin'
      });

      // Send to specific user or broadcast
      if (targetUserId || targetUserEmail) {
        // Find socket by user info
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => (targetUserId && s.userId === targetUserId) || (targetUserEmail && s.userEmail === targetUserEmail));
        
        if (targetSocket) {
          targetSocket.emit('message', {
            id: savedMessage.id,
            text: savedMessage.message,
            sender: 'admin',
            timestamp: savedMessage.createdAt
          });
        }
      } else {
        // Broadcast to all
        io.emit('message', {
          id: savedMessage.id,
          text: savedMessage.message,
          sender: 'admin',
          timestamp: savedMessage.createdAt
        });
      }

      console.log(`👨‍💼 Admin message sent:`, text);
    } catch (error) {
      console.error('Error handling admin message:', error);
      socket.emit('error', { message: 'Failed to send admin message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {
      userName,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`🔌 Socket.IO client disconnected: ${sessionId}`);
    await chatService.deactivateSession(sessionId);
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
      console.log(`💬 Socket.IO server ready on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
