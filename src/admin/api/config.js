// Resolve API base URL with sensible defaults for Docker/local dev
// Supports both Next.js (process.env.NEXT_PUBLIC_*) and Vite (import.meta.env.VITE_*)
const PROD_API_ORIGIN = 'https://api.timeliteclothing.com'
const PROD_ADMIN_BASE = `${PROD_API_ORIGIN}/admin`
const PROD_PUBLIC_BASE = `${PROD_API_ORIGIN}/api`

// Local development API base (admin backend Node.js)
const LOCAL_ADMIN_ORIGIN = 'http://localhost:3001'
const LOCAL_ADMIN_BASE = `${LOCAL_ADMIN_ORIGIN}/admin`
// Local development API base (gateway) for public API
const LOCAL_API_ORIGIN = 'http://localhost:3002'

export const getApiBaseUrl = () => {
  // Ưu tiên env (absolute URL), fallback về domain production theo mặc định
  const isNext = typeof process !== 'undefined' && process.env
  const isVite = typeof import.meta !== 'undefined' && import.meta.env

  // If environment variable is explicitly set, use it (highest priority)
  const fromEnvRaw = (isNext && process.env.NEXT_PUBLIC_API_URL)
    || (isVite && import.meta?.env?.VITE_API_URL)
    || ''
  const fromEnv = typeof fromEnvRaw === 'string' ? fromEnvRaw.trim() : ''
  
  // Debug log để kiểm tra env variable
  if (typeof window !== 'undefined' && (isNext || isVite)) {
    const isDev = (isNext && process.env.NODE_ENV === 'development')
      || (isVite && import.meta?.env?.DEV)
    if (isDev) {
      console.log('[getApiBaseUrl] Debug:', {
        fromEnvRaw,
        fromEnv,
        isNext,
        isVite,
        NEXT_PUBLIC_API_URL: isNext ? process.env.NEXT_PUBLIC_API_URL : undefined,
        VITE_API_URL: isVite ? import.meta?.env?.VITE_API_URL : undefined,
        NODE_ENV: isNext ? process.env.NODE_ENV : undefined,
        VITE_DEV: isVite ? import.meta?.env?.DEV : undefined
      })
    }
  }
  
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

  // Check if we're in development mode (build time check only)
  // For Next.js: NODE_ENV is set at build time and baked into the bundle
  // For Vite: import.meta.env.DEV is set at build time
  // IMPORTANT: We only check build-time env, not runtime hostname
  // This ensures production builds always use production API
  const isDevBuild = (isNext && process.env.NODE_ENV === 'development')
    || (isVite && import.meta?.env?.DEV)
  
  // Use local API only during development builds
  // Production builds will ALWAYS use production API, regardless of where they run
  if (isDevBuild) {
    return LOCAL_ADMIN_BASE
  }

  // Production build: always use production API (even if running on localhost)
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

  // Check if we're in development mode (build time check only)
  const isDevBuild = (isNext && process.env.NODE_ENV === 'development')
    || (isVite && import.meta?.env?.DEV)
  
  // Use local API only during development builds
  // Production builds will ALWAYS use production API, regardless of where they run
  if (isDevBuild) {
    return publicBaseTrimmed.startsWith('http')
      ? (publicBaseTrimmed.endsWith('/') ? publicBaseTrimmed.slice(0, -1) : publicBaseTrimmed)
      : `${LOCAL_API_ORIGIN}${publicBaseTrimmed.startsWith('/') ? publicBaseTrimmed : `/${publicBaseTrimmed}`}`
  }

  // Production build: always use production API (even if running on localhost)
  return publicBaseTrimmed.startsWith('http')
    ? (publicBaseTrimmed.endsWith('/') ? publicBaseTrimmed.slice(0, -1) : publicBaseTrimmed)
    : PROD_PUBLIC_BASE
}


