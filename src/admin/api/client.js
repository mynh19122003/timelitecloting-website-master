import axios from 'axios'
import { getApiBaseUrl } from './config'

// Create a pre-configured Axios instance for the app
const isDev = process.env.NODE_ENV === 'development'

const apiBaseUrl = getApiBaseUrl()
// Log API base URL trong dev mode để debug
if (isDev) {
  // eslint-disable-next-line no-console
  console.info('[Admin API] Base URL:', apiBaseUrl)
}

const shouldAutoNavigateOnAuthError = !isDev

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

        if (isDev) {
          try {
          const method = String(config?.method || 'GET').toUpperCase()
          const url = config?.url || ''
          let pathname = url
          try {
            const parsed = new URL(url, config?.baseURL || window.location.origin)
            pathname = parsed.pathname
          } catch (_) { /* ignore */ }
          const masked = token.length > 12
            ? `${token.slice(0, 6)}…${token.slice(-6)}`
            : token
            // eslint-disable-next-line no-console
          console.info(`[API Client] ${method} ${pathname} Authorization header: ${masked ? `Bearer ${masked}` : 'missing'}`)
          } catch (_) {
          // ignore logging errors
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
      
      // Clear session for authentication errors
      if (errorCode === 'ERR_INVALID_TOKEN' || 
          errorCode === 'ERR_MISSING_TOKEN' || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('token')) {
        if (shouldAutoNavigateOnAuthError) {
        try {
          // Clear session
          window.localStorage.removeItem('fastcart:token')
          window.localStorage.removeItem('fastcart:user')
            window.localStorage.removeItem('fastcart:admin_token')
          
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
        } else {
          console.warn('[API Client] Auto redirect on 401 disabled in dev, staying on page for debugging')
        }
      }
    }

    // Handle 403 Forbidden - User không có quyền truy cập
    if (normalized.status === 403) {
      const errorCode = error?.response?.data?.error
      const errorMessage = error?.response?.data?.message || 'Bạn không có quyền truy cập tài nguyên này.'
      
      // Log warning với chi tiết hơn
      console.warn('[API Client] 403 Forbidden:', errorMessage, {
        errorCode,
        url: error?.config?.url,
        method: error?.config?.method
      })
      
      // Nếu là lỗi invalid admin token, thử refresh token từ /auth/me
      if (errorCode === 'ERR_FORBIDDEN' && errorMessage.toLowerCase().includes('admin token')) {
        // Token có thể đã thay đổi, thử fetch lại từ /auth/me (fire and forget)
        import('../services/authService').then(({ fetchMe }) => {
          fetchMe().then(() => {
            console.info('[API Client] Refreshed admin token from /auth/me')
          }).catch((refreshErr) => {
            console.error('[API Client] Failed to refresh admin token:', refreshErr)
          })
        }).catch((importErr) => {
          console.error('[API Client] Failed to import authService:', importErr)
        })
      }
      
      // Nếu là lỗi permission thực sự, có thể redirect về dashboard
      if (errorCode === 'ERR_FORBIDDEN' || errorMessage.toLowerCase().includes('permission')) {
        if (shouldAutoNavigateOnAuthError) {
        const currentPath = window.location.pathname
        if (currentPath !== '/admin' && !currentPath.includes('/login')) {
          // Redirect về dashboard sau 2 giây
          setTimeout(() => {
            window.location.href = '/admin'
          }, 2000)
          }
        } else {
          console.warn('[API Client] Auto redirect on 403 disabled in dev, staying on page for debugging')
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


