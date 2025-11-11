import axios from 'axios'
import { getApiBaseUrl } from './config'

// Create a pre-configured Axios instance for the app
// Supports both Next.js and Vite
const isNext = typeof process !== 'undefined' && process.env
const isVite = typeof import.meta !== 'undefined' && import.meta.env
const isDev = (isNext && process.env.NODE_ENV === 'development')
  || (isVite && import.meta?.env?.DEV)
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost')

const apiBaseUrl = getApiBaseUrl()
// Log API base URL trong dev mode để debug
if (isDev) {
  // eslint-disable-next-line no-console
  console.info('[Admin API] Base URL:', apiBaseUrl)
}

const api = axios.create({
  baseURL: apiBaseUrl, // Luôn dùng getApiBaseUrl() để đảm bảo trỏ đúng backend
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Authorization header if token exists and is valid
api.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem('fastcart:token')
    if (token) {
      // Kiểm tra token hợp lệ trước khi gửi request
      // Import tokenUtils một cách dynamic để tránh circular dependency
      try {
        // Decode token để kiểm tra expiration
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
          const exp = payload.exp
          if (exp) {
            const expirationTime = exp * 1000
            const currentTime = Date.now()
            // Nếu token đã hết hạn, không gửi Authorization header
            // Backend sẽ trả về 401 và AuthContext sẽ xử lý
            if (currentTime >= expirationTime) {
              console.warn('[API Client] Token expired, request will likely fail')
              // Vẫn gửi request để backend trả về 401 và trigger logout
            }
          }
        }
      } catch (e) {
        // Token format không hợp lệ, bỏ qua validation
        console.warn('[API Client] Invalid token format:', e)
      }
      
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`
    }

    // For POST /admin/* (except /admin/auth/*), backend expects ADMIN_API_TOKEN via
    // Authorization: Bearer <token> (preferred) or X-Admin-Token. Since the backend
    // prioritizes Authorization when present, we explicitly override Authorization
    // to the admin token for these requests so it is not overshadowed by user auth.
    const method = String(config.method || '').toLowerCase()
    if (method === 'post') {
      const baseURL = config.baseURL || ''
      const url = config.url || ''
      let pathname = `${baseURL}${url}`
      try {
        // Ensure we only check the path portion even if absolute
        const parsed = new URL(pathname, window.location.origin)
        pathname = parsed.pathname
      } catch (_) {
        // best-effort fallback
      }

      const isAdminPath = pathname.startsWith('/admin/')
      const isAuthPath = pathname.startsWith('/admin/auth')
      if (isAdminPath && !isAuthPath) {
        const envAdminToken = (isNext && process.env.NEXT_PUBLIC_ADMIN_API_TOKEN)
          || (isVite && import.meta?.env?.VITE_ADMIN_API_TOKEN)
        const storedAdminToken = window.localStorage.getItem('fastcart:admin_token')
        const adminToken = (envAdminToken && String(envAdminToken).trim()) || storedAdminToken
        if (adminToken) {
          // eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `Bearer ${adminToken}`
        }

        // Dev-only: log nguồn lấy admin token và token được gắn (đã mask)
        if (isDev) {
          try {
            const source = envAdminToken ? 'env:VITE_ADMIN_API_TOKEN' : (storedAdminToken ? 'localStorage:fastcart:admin_token' : 'missing')
            const masked = typeof adminToken === 'string' && adminToken.length > 12
              ? `${adminToken.slice(0, 6)}…${adminToken.slice(-6)}`
              : adminToken || '(empty)'
            // eslint-disable-next-line no-console
            console.info(`[DEBUG] Admin token source: ${source}; attached: ${masked}`)
          } catch (_) {
            // ignore
          }
        }

        // Dev-only: log body thực tế gửi đi để so sánh với payload UI nếu cần
        if (isDev) {
          try {
            let bodyToLog = config.data
            if (bodyToLog instanceof FormData) {
              const obj = {}
              bodyToLog.forEach((value, key) => {
                // Tránh log binary; rút gọn chuỗi quá dài
                if (typeof value === 'string') {
                  obj[key] = value.length > 200 ? `${value.slice(0, 200)}…` : value
                } else {
                  obj[key] = '[binary]'
                }
              })
              bodyToLog = obj
            } else if (typeof bodyToLog === 'string') {
              try { bodyToLog = JSON.parse(bodyToLog) } catch (_) { /* keep string */ }
            }
            // eslint-disable-next-line no-console
            console.groupCollapsed(`[DEBUG] Request body ${method.toUpperCase()} ${pathname}`)
            // eslint-disable-next-line no-console
            console.log(bodyToLog)
            // eslint-disable-next-line no-console
            console.groupEnd()
          } catch (_) {
            // ignore
          }
        }
      }
    }
  } catch (_) {
    // no-op if storage is not accessible
  }
  return config
})

// Normalize error shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = new Error(
      error?.response?.data?.message || error?.message || 'Request failed'
    )
    normalized.status = error?.response?.status
    normalized.data = error?.response?.data

    // Handle 401 Unauthorized - clear session and redirect to login
    if (normalized.status === 401) {
      const errorCode = error?.response?.data?.error
      const errorMessage = error?.response?.data?.message || ''
      
      // Only clear session for authentication errors (not for missing admin token in POST requests)
      if (errorCode === 'ERR_INVALID_TOKEN' || 
          errorCode === 'ERR_MISSING_TOKEN' || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('token')) {
        try {
          // Clear session
          window.localStorage.removeItem('fastcart:token')
          window.localStorage.removeItem('fastcart:user')
          
          // Redirect to login if not already there
          const currentPath = window.location.pathname
          if (!currentPath.includes('/auth/login') && 
              !currentPath.includes('/login') && 
              !currentPath.includes('/signup') &&
              !currentPath.includes('/reset-password')) {
            // Lưu current path để redirect lại sau khi login
            const returnUrl = currentPath !== '/admin' ? currentPath : null
            if (returnUrl) {
              window.localStorage.setItem('fastcart:return_url', returnUrl)
            }
            window.location.href = '/admin/login'
          }
        } catch (_) {
          // ignore localStorage errors
        }
      }
    }

    // Handle 403 Forbidden - User không có quyền truy cập
    if (normalized.status === 403) {
      const errorCode = error?.response?.data?.error
      const errorMessage = error?.response?.data?.message || 'Bạn không có quyền truy cập tài nguyên này.'
      
      // Log warning nhưng không redirect (có thể là lỗi tạm thời)
      console.warn('[API Client] 403 Forbidden:', errorMessage)
      
      // Nếu là lỗi permission thực sự, có thể redirect về dashboard
      if (errorCode === 'ERR_FORBIDDEN' || errorMessage.toLowerCase().includes('permission')) {
        const currentPath = window.location.pathname
        if (currentPath !== '/admin' && !currentPath.includes('/login')) {
          // Redirect về dashboard sau 2 giây
          setTimeout(() => {
            window.location.href = '/admin'
          }, 2000)
        }
      }
    }

    // Dev-only: log chi tiết lỗi + body đã gửi (ẩn token)
    try {
      if (isDev) {
        const cfg = error?.config || {}
        const method = String(cfg.method || 'GET').toUpperCase()
        const baseURL = cfg.baseURL || ''
        const url = cfg.url || ''
        let pathname = `${baseURL}${url}`
        try {
          const parsed = new URL(pathname, window.location.origin)
          pathname = parsed.pathname
        } catch (_) { /* ignore */ }

        let bodyToLog = cfg.data
        if (bodyToLog instanceof FormData) {
          const obj = {}
          bodyToLog.forEach((value, key) => {
            if (typeof value === 'string') {
              obj[key] = value.length > 200 ? `${value.slice(0, 200)}…` : value
            } else {
              obj[key] = '[binary]'
            }
          })
          bodyToLog = obj
        } else if (typeof bodyToLog === 'string') {
          try { bodyToLog = JSON.parse(bodyToLog) } catch (_) { /* keep string */ }
        }

        // eslint-disable-next-line no-console
        console.groupCollapsed(`[API ERROR ${normalized.status || ''}] ${method} ${pathname}`)
        // eslint-disable-next-line no-console
        console.log('requestBody:', bodyToLog)
        // eslint-disable-next-line no-console
        console.log('response:', error?.response?.data)
        // eslint-disable-next-line no-console
        console.groupEnd()
      }
    } catch (_) {
      // ignore
    }
    return Promise.reject(normalized)
  }
)

export default api


