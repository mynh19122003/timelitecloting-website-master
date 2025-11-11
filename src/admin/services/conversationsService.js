import { AdminApi } from '../api'

/**
 * Get all conversations
 */
export const listConversations = async () => {
  try {
    const res = await AdminApi.get('/conversations')
    const payload = res?.data || {}
    const data = payload?.data || payload || []
    
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to list conversations:', error)
    throw error
  }
}

/**
 * Get a single conversation
 */
export const getConversation = async (conversationId) => {
  try {
    const res = await AdminApi.get(`/conversations/${conversationId}`)
    const payload = res?.data || {}
    const data = payload?.data || payload || {}
    
    return data
  } catch (error) {
    console.error('Failed to get conversation:', error)
    throw error
  }
}

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId) => {
  try {
    const res = await AdminApi.get(`/conversations/${conversationId}/messages`)
    const payload = res?.data || {}
    const data = payload?.data || payload || []
    
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to get messages:', error)
    throw error
  }
}

export default {
  listConversations,
  getConversation,
  getMessages
}


