import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiUser } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';
import styles from './LiveChatModal.module.css';
import { API_CONFIG } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string | number;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

interface LiveChatModalProps {
  onClose: () => void;
}

export const LiveChatModal = ({ onClose }: LiveChatModalProps) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Get auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Connect to Socket.IO server
    const socketUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Remove /api if present
    const newSocket = io(socketUrl, {
      auth: {
        token: authToken || undefined,
        email: user?.email || undefined,
        name: user?.name || undefined
      },
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    // Connected event (sent by server)
    newSocket.on('connected', (data) => {
      console.log('📡 Server confirmed connection:', data);
      setIsConnected(true);
    });

    // Load message history
    newSocket.on('messageHistory', (history: any[]) => {
      console.log('📜 Message history received:', history);
      const formattedMessages: Message[] = history.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender_type === 'admin' ? 'admin' : 'user',
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(formattedMessages);
    });

    // Receive new messages
    newSocket.on('message', (data: any) => {
      console.log('📨 New message received:', data);
      const newMessage: Message = {
        id: data.id || Date.now(),
        text: data.text,
        sender: data.sender === 'admin' ? 'admin' : 'user',
        timestamp: new Date(data.timestamp || Date.now())
      };
      
      // Replace optimistic temp message with real message from server, or add new message
      setMessages(prev => {
        // Check if this message already exists (by ID)
        const existsById = prev.some(msg => msg.id === newMessage.id);
        if (existsById) {
          return prev; // Don't add duplicate
        }
        
        // For user messages, try to replace temp message with real one
        if (newMessage.sender === 'user') {
          const tempMessageIndex = prev.findIndex(msg => 
            msg.id.toString().startsWith('temp-') && 
            msg.text === newMessage.text && 
            msg.sender === 'user'
          );
          
          if (tempMessageIndex !== -1) {
            // Replace temp message with real message
            const updated = [...prev];
            updated[tempMessageIndex] = newMessage;
            return updated;
          }
        }
        
        // Add new message (for admin messages or if no temp message found)
        return [...prev, newMessage];
      });
    });

    // Handle errors
    newSocket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      // Optionally show error to user
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !socket || !isConnected) return;

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, tempMessage]);
    const messageText = inputMessage.trim();
    setInputMessage('');

    // Send message via Socket.IO
    socket.emit('message', {
      text: messageText
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <FiUser className={styles.avatarIcon} />
            </div>
            <div>
              <h3 className={styles.title}>Live Chat</h3>
              <p className={styles.status}>
                <span className={`${styles.statusDot} ${isConnected ? styles.online : styles.offline}`} />
                {isConnected ? 'Online' : 'Connecting...'}
              </p>
            </div>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close chat"
          >
            <FiX className={styles.closeIcon} />
          </button>
        </div>

        {/* Messages Container */}
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.sender === 'user' ? styles.userMessage : styles.adminMessage
              }`}
            >
              <div className={styles.messageBubble}>
                <p className={styles.messageText}>{message.text}</p>
                <span className={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className={styles.inputForm} onSubmit={handleSendMessage}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!isConnected}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!inputMessage.trim() || !isConnected}
            aria-label="Send message"
          >
            <FiSend className={styles.sendIcon} />
          </button>
        </form>

      </div>
    </div>
  );
};



