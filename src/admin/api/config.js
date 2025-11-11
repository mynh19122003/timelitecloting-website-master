// Resolve API base URL with sensible defaults for Docker/local dev
// Supports both Next.js (process.env.NEXT_PUBLIC_*) and Vite (import.meta.env.VITE_*)
export const getApiBaseUrl = () => {
  // Check for Next.js env vars first, then Vite
  const isNext = typeof process !== 'undefined' && process.env
  const isVite = typeof import.meta !== 'undefined' && import.meta.env
  
  // Default to /api/admin to avoid conflict with Next.js app routes
  const adminBase = (isNext && process.env.NEXT_PUBLIC_ADMIN_BASE) 
    || (isVite && import.meta?.env?.VITE_ADMIN_BASE) 
    || '/api/admin'
  const adminBaseTrimmed = String(adminBase).trim()
  
  const isDev = (isNext && process.env.NODE_ENV === 'development')
    || (isVite && import.meta?.env?.DEV)
    || (typeof window !== 'undefined' && window.location.hostname === 'localhost')

  // Dev: dùng absolute URL tới gateway (port 80) thay vì trỏ trực tiếp :3001
  // Browser sẽ resolve relative URL thành window.location.origin (port 3000) nếu chạy dev server, nên dùng http://localhost
  if (isDev) {
    // Nếu đã có absolute URL trong env, dùng nó
    const fromEnvRaw = (isNext && process.env.NEXT_PUBLIC_API_URL)
      || (isVite && import.meta?.env?.VITE_API_URL)
      || ''
    const fromEnv = typeof fromEnvRaw === 'string' ? fromEnvRaw.trim() : ''
    if (fromEnv) {
      try {
        // Parse URL để kiểm tra và sửa port nếu thiếu
        const url = new URL(fromEnv)
        // Chuẩn hoá về gateway (port 80) khi trỏ localhost không có port
        if (url.hostname === 'localhost' && url.port === '') url.port = '80'
        let base = url.toString().endsWith('/') ? url.toString().slice(0, -1) : url.toString()
        // Đảm bảo có /admin trong path
        if (!base.includes('/admin')) {
          base = `${base}/admin`
        }
        return base
      } catch (_) {
        // Nếu parse URL thất bại, fallthrough to default
      }
    }
    // Default: dùng gateway (port 80) để phù hợp môi trường public VPS
    return 'http://localhost/admin'
  }

  // Prefer explicit absolute backend host and append admin base if missing
  const fromEnvRaw = (isNext && process.env.NEXT_PUBLIC_API_URL)
    || (isVite && import.meta?.env?.VITE_API_URL)
    || ''
  const fromEnv = typeof fromEnvRaw === 'string' ? fromEnvRaw.trim() : ''
  if (fromEnv) {
    try {
      const base = fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv
      const needsAdmin = adminBaseTrimmed && adminBaseTrimmed !== '/' && !base.endsWith(adminBaseTrimmed)
      return needsAdmin ? `${base}${adminBaseTrimmed.startsWith('/') ? adminBaseTrimmed : `/${adminBaseTrimmed}`}` : base
    } catch (_) {
      return fromEnv
    }
  }

  // Production fallback (qua gateway)
  return '/admin'
}

// Resolve Public API base URL (catalog/orders), default to /api in dev
// Supports both Next.js (process.env.NEXT_PUBLIC_*) and Vite (import.meta.env.VITE_*)
export const getPublicApiBaseUrl = () => {
  const isNext = typeof process !== 'undefined' && process.env
  const isVite = typeof import.meta !== 'undefined' && import.meta.env
  
  const publicBase = (isNext && process.env.NEXT_PUBLIC_PUBLIC_BASE)
    || (isVite && import.meta?.env?.VITE_PUBLIC_BASE)
    || '/api'
  const publicBaseTrimmed = String(publicBase).trim()
  
  const isDev = (isNext && process.env.NODE_ENV === 'development')
    || (isVite && import.meta?.env?.DEV)
    || (typeof window !== 'undefined' && window.location.hostname === 'localhost')

  if (isDev) return publicBaseTrimmed

  const fromEnvRaw = (isNext && process.env.NEXT_PUBLIC_PUBLIC_API_URL)
    || (isVite && import.meta?.env?.VITE_PUBLIC_API_URL)
    || ''
  const fromEnv = typeof fromEnvRaw === 'string' ? fromEnvRaw.trim() : ''
  if (fromEnv) return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv

  // Production fallback
  return 'http://localhost:8000/api'
}


