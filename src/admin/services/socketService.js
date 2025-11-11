import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(adminId, adminName, serverUrl = null) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Determine server URL
    const baseUrl = serverUrl || this.getSocketUrl();
    console.log(`Connecting to Socket.IO server: ${baseUrl}`);

    this.socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      withCredentials: true,
      autoConnect: true
    });

    this.setupEventHandlers(adminId, adminName);
  }

  getSocketUrl() {
    // Check if we're in development or production
    const isDev = import.meta?.env?.DEV;
    
    // Check for explicit socket URL
    const envUrl = import.meta?.env?.VITE_SOCKET_URL;
    if (envUrl) {
      return envUrl;
    }

    if (isDev) {
      // Development: connect directly to admin backend on port 3002
      return 'http://localhost:3002';
    }

    // Production: use admin API base URL pattern
    const apiUrl = import.meta?.env?.VITE_API_URL || 'http://localhost:3002';
    return apiUrl.replace(/\/admin.*$/, '');
  }

  setupEventHandlers(adminId, adminName) {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket.id);
      this.isConnected = true;
      
      // Join admin room
      if (adminId) {
        this.socket.emit('admin:join', { adminId, name: adminName || 'Admin' });
      }

      // Notify listeners
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.emit('error', error);
    });

    // Admin join confirmation
    this.socket.on('admin:joined', (data) => {
      console.log('✅ Admin joined room:', data);
      this.emit('admin:joined', data);
    });

    // Message events
    this.socket.on('message:new', (messageData) => {
      this.emit('message:new', messageData);
    });

    this.socket.on('message:sent', (messageData) => {
      this.emit('message:sent', messageData);
    });

    this.socket.on('message:error', (error) => {
      console.error('Message error:', error);
      this.emit('message:error', error);
    });

    // Typing indicators
    this.socket.on('typing:admin', (data) => {
      this.emit('typing:admin', data);
    });

    this.socket.on('typing:admin:stop', (data) => {
      this.emit('typing:admin:stop', data);
    });
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join conversation');
      return;
    }
    this.socket.emit('conversation:join', conversationId);
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (!this.socket?.connected) return;
    this.socket.emit('conversation:leave', conversationId);
  }

  // Send a message
  sendMessage(conversationId, message, customerId = null) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send message');
      return Promise.reject(new Error('Socket not connected'));
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      const handleSent = (data) => {
        clearTimeout(timeout);
        this.socket.off('message:sent', handleSent);
        this.socket.off('message:error', handleError);
        resolve(data);
      };

      const handleError = (error) => {
        clearTimeout(timeout);
        this.socket.off('message:sent', handleSent);
        this.socket.off('message:error', handleError);
        reject(error);
      };

      this.socket.on('message:sent', handleSent);
      this.socket.on('message:error', handleError);
      this.socket.emit('message:send', { conversationId, message, customerId });
    });
  }

  // Start typing indicator
  startTyping(conversationId, customerId = null) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:start', { conversationId, customerId });
  }

  // Stop typing indicator
  stopTyping(conversationId, customerId = null) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:stop', { conversationId, customerId });
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Emit to listeners
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in socket listener for ${event}:`, error);
      }
    });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Export singleton instance
export default new SocketService();
