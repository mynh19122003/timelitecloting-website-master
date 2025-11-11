import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react'
import { fetchMe } from '../services/authService'
import { clearSession } from '../services/authService'
import { isValidToken, isTokenExpired, getTokenTimeRemaining } from '../utils/tokenUtils'

const AuthContext = createContext(null)

// Session timeout: 30 phút không hoạt động sẽ tự động logout
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
// Token refresh interval: Kiểm tra token mỗi 5 phút
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem('fastcart:user')
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Refs để quản lý intervals và timeouts
  const tokenCheckIntervalRef = useRef(null)
  const sessionTimeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  // Cập nhật last activity khi user tương tác
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [])

  // Kiểm tra và validate token
  const validateToken = async () => {
    const token = window.localStorage.getItem('fastcart:token')
    
    if (!token) {
      if (user) {
        clearSession()
        setUser(null)
      }
      setIsLoading(false)
      setIsInitialized(true)
      return false
    }

    // Kiểm tra token format và expiration
    if (!isValidToken(token)) {
      console.warn('[AuthContext] Token invalid or expired, clearing session')
      clearSession()
      setUser(null)
      setIsLoading(false)
      setIsInitialized(true)
      return false
    }

    return true
  }

  // Fetch user info từ API
  const loadUser = async () => {
    try {
      const me = await fetchMe()
      setUser(me)
      return true
    } catch (error) {
      console.error('[AuthContext] Failed to fetch user:', error)
      // Nếu lỗi 401, token không hợp lệ
      if (error?.status === 401) {
        clearSession()
        setUser(null)
      }
      return false
    }
  }

  // Khởi tạo authentication state
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      setIsLoading(true)
      
      const token = window.localStorage.getItem('fastcart:token')
      
      if (!token) {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
          setIsInitialized(true)
        }
        return
      }

      // Validate token trước
      const isValid = await validateToken()
      if (!isValid || !isMounted) {
        if (isMounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
        return
      }

      // Load user info
      const success = await loadUser()
      if (isMounted) {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
    // Chỉ chạy một lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kiểm tra token định kỳ và auto-refresh
  useEffect(() => {
    if (!user) {
      // Clear intervals nếu không có user
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
        sessionTimeoutRef.current = null
      }
      return
    }

    // Kiểm tra token định kỳ
    const checkToken = async () => {
      const token = window.localStorage.getItem('fastcart:token')
      
      if (!token || !isValidToken(token)) {
        console.warn('[AuthContext] Token expired during check, logging out')
        clearSession()
        setUser(null)
        return
      }

      // Nếu token sắp hết hạn (còn < 10 phút), thử refresh bằng cách fetch user
      const timeRemaining = getTokenTimeRemaining(token)
      if (timeRemaining && timeRemaining < 10 * 60 * 1000) {
        try {
          await loadUser()
        } catch (error) {
          console.error('[AuthContext] Failed to refresh user:', error)
        }
      }
    }

    // Kiểm tra ngay lập tức
    checkToken()

    // Set interval để kiểm tra định kỳ
    tokenCheckIntervalRef.current = setInterval(checkToken, TOKEN_CHECK_INTERVAL)

    // Kiểm tra session timeout
    const checkSessionTimeout = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current
      
      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        console.warn('[AuthContext] Session timeout, logging out')
        clearSession()
        setUser(null)
        // Hiển thị thông báo cho user
        alert('Phiên đăng nhập đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.')
      } else {
        // Schedule next check
        const remainingTime = SESSION_TIMEOUT - timeSinceLastActivity
        sessionTimeoutRef.current = setTimeout(checkSessionTimeout, remainingTime)
      }
    }

    // Schedule session timeout check
    sessionTimeoutRef.current = setTimeout(checkSessionTimeout, SESSION_TIMEOUT)

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
        sessionTimeoutRef.current = null
      }
    }
  }, [user])

  // Lưu user vào localStorage khi thay đổi
  useEffect(() => {
    if (user) {
      window.localStorage.setItem('fastcart:user', JSON.stringify(user))
    } else {
      window.localStorage.removeItem('fastcart:user')
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      setUser,
      isLoading,
      isInitialized,
      signOut: () => {
        // Clear intervals và timeouts
        if (tokenCheckIntervalRef.current) {
          clearInterval(tokenCheckIntervalRef.current)
          tokenCheckIntervalRef.current = null
        }
        if (sessionTimeoutRef.current) {
          clearTimeout(sessionTimeoutRef.current)
          sessionTimeoutRef.current = null
        }
        clearSession()
        setUser(null)
      }
    }),
    [user, isLoading, isInitialized]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext

