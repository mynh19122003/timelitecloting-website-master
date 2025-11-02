import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiUser } from 'react-icons/fi';
import styles from './LiveChatModal.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

interface LiveChatModalProps {
  onClose: () => void;
}

export const LiveChatModal = ({ onClose }: LiveChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to Timelite Couture. How can we assist you today?',
      sender: 'admin',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔌 TODO: Initialize Socket.IO connection
  useEffect(() => {
    // Simulate connection (replace with real Socket.IO)
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    /*
    // 🚀 SOCKET.IO INTEGRATION PLACEHOLDER
    // Uncomment and configure when ready:
    
    import { io } from 'socket.io-client';
    
    const socket = io('http://localhost:3001', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      setIsConnected(false);
    });

    socket.on('message', (data) => {
      const newMessage: Message = {
        id: data.id || Date.now().toString(),
        text: data.text,
        sender: 'admin',
        timestamp: new Date(data.timestamp)
      };
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
    */

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // 🔌 TODO: Send message via Socket.IO
    /*
    socket.emit('message', {
      text: inputMessage,
      timestamp: new Date().toISOString()
    });
    */

    // Simulate admin response (remove when using real Socket.IO)
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message! Our team will respond shortly.',
        sender: 'admin',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1500);
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

        {/* Socket.IO Integration Notice */}
        <div className={styles.notice}>
          💡 Socket.IO integration ready - see LiveChatModal.tsx
        </div>
      </div>
    </div>
  );
};



