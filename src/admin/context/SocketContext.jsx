import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Connect socket
    socketService.connect(user.id, user.name || user.email);

    // Listen to connection events
    const handleConnect = () => {
      setIsConnected(true);
      const status = socketService.getConnectionStatus();
      setSocketId(status.socketId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    // Initial status check
    const status = socketService.getConnectionStatus();
    setIsConnected(status.isConnected);
    setSocketId(status.socketId);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.disconnect();
    };
  }, [user?.id, user?.name, user?.email]);

  const joinConversation = useCallback((conversationId) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const sendMessage = useCallback(async (conversationId, message, customerId) => {
    return socketService.sendMessage(conversationId, message, customerId);
  }, []);

  const startTyping = useCallback((conversationId, customerId) => {
    socketService.startTyping(conversationId, customerId);
  }, []);

  const stopTyping = useCallback((conversationId, customerId) => {
    socketService.stopTyping(conversationId, customerId);
  }, []);

  const value = {
    isConnected,
    socketId,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    socketService // Expose service for advanced usage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

