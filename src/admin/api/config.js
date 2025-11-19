// Resolve API base URL with sensible defaults for Docker/local dev
// Supports both Next.js (process.env.NEXT_PUBLIC_*) and Vite (import.meta.env.VITE_*)
const PROD_API_ORIGIN = 'https://api.timeliteclothing.com'
const PROD_ADMIN_BASE = `${PROD_API_ORIGIN}/admin`
const PROD_PUBLIC_BASE = `${PROD_API_ORIGIN}/api`

export const getApiBaseUrl = () => {
  // Ưu tiên env (absolute URL), fallback về domain production theo mặc định
  const isNext = typeof process !== 'undefined' && process.env
  const isVite = typeof import.meta !== 'undefined' && import.meta.env

  const fromEnvRaw = (isNext && process.env.NEXT_PUBLIC_API_URL)
    || (isVite && import.meta?.env?.VITE_API_URL)
    || ''
  const fromEnv = typeof fromEnvRaw === 'string' ? fromEnvRaw.trim() : ''
  if (fromEnv) {
    try {
      const url = new URL(fromEnv)
      let base = url.toString().endsWith('/') ? url.toString().slice(0, -1) : url.toString()
      if (!base.includes('/admin')) {
        base = `${base}/admin`
      }
      return base
    } catch (_) {
      return fromEnv
    }
  }

  // Mặc định production
  return PROD_ADMIN_BASE
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

  const fromEnvRaw = (isNext && process.env.NEXT_PUBLIC_PUBLIC_API_URL)
    || (isVite && import.meta?.env?.VITE_PUBLIC_API_URL)
    || ''
  const fromEnv = typeof fromEnvRaw === 'string' ? fromEnvRaw.trim() : ''
  if (fromEnv) return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv

  // Fallback luôn dùng domain production
  return publicBaseTrimmed.startsWith('http')
    ? (publicBaseTrimmed.endsWith('/') ? publicBaseTrimmed.slice(0, -1) : publicBaseTrimmed)
    : PROD_PUBLIC_BASE
}


