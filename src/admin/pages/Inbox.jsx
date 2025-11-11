import React, { useMemo, useState, useEffect, useRef, useCallback } from "react"
import { FiSend, FiPaperclip, FiMoreHorizontal, FiSearch, FiUser, FiInfo, FiSettings, FiPlus } from "react-icons/fi"
import Button from '../components/Button/Button'
import styles from "./Inbox.module.css"
import { useSocket } from '../context/SocketContext'
import socketService from '../services/socketService'
import conversationsService from '../services/conversationsService'

const Inbox = () => {
  const { isConnected, joinConversation, leaveConversation, sendMessage, startTyping, stopTyping } = useSocket()
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState("")
  const [conversations, setConversations] = useState({})
  const [messages, setMessages] = useState({})
  const [typingStatus, setTypingStatus] = useState({})
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true)
        const convs = await conversationsService.listConversations()
        
        // Transform to object format
        const conversationsObj = {}
        convs.forEach(conv => {
          conversationsObj[conv.conversation_id] = {
            id: conv.conversation_id,
            conversation_id: conv.conversation_id,
            participant: conv.participant,
            meta: conv.meta,
            unread: conv.unread || 0,
            messages: [] // Will be loaded separately
          }
        })
        
        setConversations(conversationsObj)
        
        // Select first conversation if available and no conversation is selected
        if (convs.length > 0 && !selectedId) {
          setSelectedId(convs[0].conversation_id)
        }
      } catch (error) {
        // Don't log 401 errors as they're handled by interceptor (redirect to login)
        if (error.status !== 401) {
          console.error('Failed to load conversations:', error)
        }
        setConversations({})
      } finally {
        setLoading(false)
      }
    }
    
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedId) return
    
    const loadMessages = async () => {
      try {
        const msgs = await conversationsService.getMessages(selectedId)
        
        setMessages(prev => ({
          ...prev,
          [selectedId]: msgs
        }))
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } catch (error) {
        // Don't log 401 errors as they're handled by interceptor (redirect to login)
        if (error.status !== 401) {
          console.error('Failed to load messages:', error)
        }
      }
    }
    
    loadMessages()
  }, [selectedId])

  // Merge loaded messages with conversations
  const conversationsWithMessages = useMemo(() => {
    const result = { ...conversations }
    Object.keys(messages).forEach(convId => {
      if (result[convId]) {
        result[convId] = {
          ...result[convId],
          messages: messages[convId] || []
        }
      }
    })
    return result
  }, [conversations, messages])

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (messageData) => {
      const { conversationId, message, from, timestamp } = messageData
      
      if (!conversationId) return

      setMessages(prev => {
        const convMessages = prev[conversationId] || []
        // Avoid duplicates
        if (convMessages.some(m => m.id === messageData.id)) {
          return prev
        }
        return {
          ...prev,
          [conversationId]: [
            ...convMessages,
            {
              id: messageData.id || `msg_${Date.now()}`,
              author: from === 'admin' ? 'agent' : 'customer',
              text: message,
              time: formatTime(timestamp),
              timestamp
            }
          ]
        }
      })

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }

    const handleTyping = (data) => {
      if (data.conversationId === selectedId) {
        setTypingStatus(prev => ({
          ...prev,
          [data.conversationId]: data.adminName || 'Admin'
        }))
      }
    }

    const handleTypingStop = (data) => {
      if (data.conversationId === selectedId) {
        setTypingStatus(prev => {
          const next = { ...prev }
          delete next[data.conversationId]
          return next
        })
      }
    }

    socketService.on('message:new', handleNewMessage)
    socketService.on('typing:admin', handleTyping)
    socketService.on('typing:admin:stop', handleTypingStop)

    return () => {
      socketService.off('message:new', handleNewMessage)
      socketService.off('typing:admin', handleTyping)
      socketService.off('typing:admin:stop', handleTypingStop)
    }
  }, [selectedId])

  // Handle typing indicators
  const handleInputChange = (e) => {
    setInputValue(e.target.value)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Start typing indicator
    if (selectedId && isConnected && activeConversation) {
      startTyping(selectedId, activeConversation.participant?.id)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedId && isConnected && activeConversation) {
        stopTyping(selectedId, activeConversation.participant?.id)
      }
    }, 2000)
  }

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isSending || !isConnected || !activeConversation) return

    const message = inputValue.trim()
    setIsSending(true)

    try {
      await sendMessage(selectedId, message, activeConversation.participant?.id)
      
      // Clear input
      setInputValue("")
      
      // Stop typing indicator
      if (selectedId && isConnected) {
        stopTyping(selectedId, activeConversation.participant?.id)
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  // Format time helper
  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } catch {
      return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  const [threads, setThreads] = useState([])

  useEffect(() => {
    // Transform conversations to threads format
    const loadedThreads = Object.keys(conversationsWithMessages).map(convId => {
      const conv = conversationsWithMessages[convId]
      const lastMsg = conv.messages && conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1]
        : null
      return {
        id: convId,
        name: conv.participant?.name || 'Customer',
        lastMessage: lastMsg?.text || '',
        time: lastMsg?.time || '',
        unread: conv.unread || 0,
        online: conv.participant?.online || false
      }
    })
    setThreads(loadedThreads)
  }, [conversationsWithMessages])

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads
    const query = search.toLowerCase()
    return threads.filter(
      (thread) =>
        thread.name.toLowerCase().includes(query) || (thread.lastMessage || "").toLowerCase().includes(query)
    )
  }, [search, threads])

  const activeConversation = selectedId ? conversationsWithMessages[selectedId] : null
  const isTyping = typingStatus[selectedId]

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Inbox</h1>
            <p>Loading conversations...</p>
          </div>
        </header>
      </div>
    )
  }

  if (!activeConversation && threads.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Inbox</h1>
            <p>No conversations yet. {!isConnected && <span style={{ color: '#f2555b' }}>(Disconnected)</span>}</p>
          </div>
          <Button type='button' variant='primary'>
            <FiPlus /> New message
          </Button>
        </header>
      </div>
    )
  }

  if (!activeConversation) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Inbox</h1>
            <p>Select a conversation to start chatting. {!isConnected && <span style={{ color: '#f2555b' }}>(Disconnected)</span>}</p>
          </div>
          <Button type='button' variant='primary'>
            <FiPlus /> New message
          </Button>
        </header>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Conversations</h2>
              <div className={styles.searchField}>
                <FiSearch />
                <input
                  type='search'
                  placeholder='Search conversations'
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <ul className={styles.threadList}>
              {filteredThreads.map((thread) => (
                <li
                  key={thread.id}
                  className={styles.threadItem}
                  onClick={() => setSelectedId(thread.id)}
                >
                  <div className={styles.avatar}>
                    <span>{thread.name.charAt(0)}</span>
                    {thread.online && <span className={styles.online} />}
                  </div>
                  <div className={styles.threadMeta}>
                    <div className={styles.threadTop}>
                      <span className={styles.name}>{thread.name}</span>
                      <span className={styles.time}>{thread.time}</span>
                    </div>
                    <p>{thread.lastMessage}</p>
                  </div>
                  {thread.unread > 0 && <span className={styles.badge}>{thread.unread}</span>}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Inbox</h1>
          <p>Reply to customer conversations in real time. {!isConnected && <span style={{ color: '#f2555b' }}>(Disconnected)</span>}</p>
        </div>
        <Button type='button' variant='primary'>
          <FiPlus /> New message
        </Button>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Conversations</h2>
            <div className={styles.searchField}>
              <FiSearch />
              <input
                type='search'
                placeholder='Search conversations'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <ul className={styles.threadList}>
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeConversation.id
              return (
                <li
                  key={thread.id}
                  className={`${styles.threadItem} ${isActive ? styles.active : ''}`}
                  onClick={() => setSelectedId(thread.id)}
                >
                  <div className={styles.avatar}>
                    <span>{thread.name.charAt(0)}</span>
                    {thread.online && <span className={styles.online} />}
                  </div>
                  <div className={styles.threadMeta}>
                    <div className={styles.threadTop}>
                      <span className={styles.name}>{thread.name}</span>
                      <span className={styles.time}>{thread.time}</span>
                    </div>
                    <p>{thread.lastMessage}</p>
                  </div>
                  {thread.unread > 0 && <span className={styles.badge}>{thread.unread}</span>}
                </li>
              )
            })}
          </ul>
        </aside>

        <section className={styles.conversation}>
          <header className={styles.conversationHeader}>
            <div>
              <div className={styles.participant}>
                  <span>{activeConversation.participant?.name || 'Customer'}</span>
                  {activeConversation.participant?.online && <span className={styles.statusDot} />}
              </div>
                <small>
                  {isTyping ? `Typing...` : activeConversation.meta || 'No messages yet'}
                </small>
            </div>
            <div className={styles.headerActions}>
              <Button type='button' variant='ghost' iconOnly aria-label='View customer'>
                <FiUser />
              </Button>
              <Button type='button' variant='ghost' iconOnly aria-label='Conversation info'>
                <FiInfo />
              </Button>
              <Button type='button' variant='ghost' iconOnly aria-label='More options'>
                <FiSettings />
              </Button>
            </div>
          </header>

          <div className={styles.messages}>
            {activeConversation.messages && activeConversation.messages.length > 0 ? (
              activeConversation.messages.map((message) => {
              const isAgent = message.author === 'agent'
              return (
                <div key={message.id} className={`${styles.message} ${isAgent ? styles.agent : styles.customer}`}>
                  {message.text && <p>{message.text}</p>}
                  {message.attachments && (
                    <div className={styles.attachments}>
                      {message.attachments.map((src, index) => (
                        <img key={index} src={src} alt='Product preview' />
                      ))}
                    </div>
                  )}
                  <span>{message.time}</span>
                </div>
              )
              })
            ) : (
              <div className={styles.emptyMessages}>
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.composer} onSubmit={handleSendMessage}>
            <Button type='button' variant='ghost' iconOnly aria-label='Attach file'>
              <FiPaperclip />
            </Button>
            <input 
              placeholder={isConnected ? 'Write your reply...' : 'Connecting...'} 
              value={inputValue}
              onChange={handleInputChange}
              disabled={!isConnected || isSending}
            />
            <Button type='submit' variant='primary' disabled={!isConnected || isSending || !inputValue.trim()}>
              <FiSend />
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Inbox