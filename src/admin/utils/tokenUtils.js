/**
 * Token Utilities - Các hàm tiện ích để xử lý JWT tokens
 */

/**
 * Decode JWT token (không verify signature)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload hoặc null nếu invalid
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch (error) {
    console.warn('[TokenUtils] Failed to decode token:', error)
    return null
  }
}

/**
 * Kiểm tra token có hết hạn chưa
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token còn hợp lệ, false nếu đã hết hạn
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return true
  }

  // exp là timestamp (seconds), Date.now() là milliseconds
  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()
  
  // Thêm buffer 5 phút để refresh trước khi hết hạn
  const bufferTime = 5 * 60 * 1000 // 5 minutes
  
  return currentTime >= (expirationTime - bufferTime)
}

/**
 * Kiểm tra token có hợp lệ không (format và expiration)
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token hợp lệ
 */
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false
  }

  const decoded = decodeToken(token)
  if (!decoded) {
    return false
  }

  // Kiểm tra có exp không
  if (!decoded.exp) {
    return false
  }

  // Kiểm tra chưa hết hạn
  return !isTokenExpired(token)
}

/**
 * Lấy thời gian còn lại của token (milliseconds)
 * @param {string} token - JWT token
 * @returns {number|null} - Thời gian còn lại hoặc null nếu invalid
 */
export const getTokenTimeRemaining = (token) => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return null
  }

  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()
  const remaining = expirationTime - currentTime

  return remaining > 0 ? remaining : 0
}

/**
 * Lấy thông tin user từ token
 * @param {string} token - JWT token
 * @returns {object|null} - User info hoặc null
 */
export const getUserFromToken = (token) => {
  const decoded = decodeToken(token)
  if (!decoded) {
    return null
  }

  return {
    id: decoded.sub || decoded.id || decoded.user_id,
    email: decoded.email || decoded.admin_email,
    role: decoded.role || decoded.scope || 'admin',
    admin_id: decoded.aid || decoded.admin_id
  }
}










