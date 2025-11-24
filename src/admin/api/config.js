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

// Helper: Check if hostname is localhost
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]'])
const isLocalHostname = (hostname) => {
  if (!hostname) return false
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase())
}

// Helper: Get runtime location (window.location)
const getRuntimeLocation = () => {
  if (typeof window !== 'undefined' && window.location) return window.location
  return null
}

// Helper: Force production API if running on production domain but API URL points to localhost
const forceProdIfDeployed = (url, isAdminApi = true) => {
  try {
    const parsed = new URL(url)
    // If URL is already production, return as is
    if (!isLocalHostname(parsed.hostname)) {
      return url
    }
    // Check runtime hostname
    const runtimeLocation = getRuntimeLocation()
    if (runtimeLocation && !isLocalHostname(runtimeLocation.hostname)) {
      // Running on production domain but API URL points to localhost - force production
      const forcedUrl = isAdminApi ? PROD_ADMIN_BASE : PROD_PUBLIC_BASE
      console.warn(`[Admin API] Detected production origin but API URL points to localhost. Forcing production API domain.`, {
        runtimeHost: runtimeLocation.hostname,
        previousApiHost: parsed.hostname,
        forced: forcedUrl
      })
      return forcedUrl
    }
    return url
  } catch {
    return url
  }
}

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
      // Force production if running on production domain
      return forceProdIfDeployed(base, true)
    } catch (_) {
      return forceProdIfDeployed(fromEnv, true)
    }
  }

  // Check if we're in development mode (build time check only)
  // For Next.js: NODE_ENV is set at build time and baked into the bundle
  // For Vite: import.meta.env.DEV is set at build time
  const isDevBuild = (isNext && process.env.NODE_ENV === 'development')
    || (isVite && import.meta?.env?.DEV)
  
  // Check runtime hostname to force production API if needed
  const runtimeLocation = getRuntimeLocation()
  const isRuntimeProduction = runtimeLocation && !isLocalHostname(runtimeLocation.hostname)
  
  // If running on production domain, ALWAYS use production API (even in dev build)
  if (isRuntimeProduction) {
    return PROD_ADMIN_BASE
  }
  
  // Use local API only during development builds and when running on localhost
  if (isDevBuild) {
    return LOCAL_ADMIN_BASE
  }

  // Production build: always use production API
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
  
  if (fromEnv) {
    const cleaned = fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv
    // Force production if running on production domain
    return forceProdIfDeployed(cleaned, false)
  }

  // Check if we're in development mode (build time check only)
  const isDevBuild = (isNext && process.env.NODE_ENV === 'development')
    || (isVite && import.meta?.env?.DEV)
  
  // Check runtime hostname to force production API if needed
  const runtimeLocation = getRuntimeLocation()
  const isRuntimeProduction = runtimeLocation && !isLocalHostname(runtimeLocation.hostname)
  
  // If running on production domain, ALWAYS use production API (even in dev build)
  if (isRuntimeProduction) {
    return PROD_PUBLIC_BASE
  }
  
  // Use local API only during development builds and when running on localhost
  if (isDevBuild) {
    const resolved = publicBaseTrimmed.startsWith('http')
      ? (publicBaseTrimmed.endsWith('/') ? publicBaseTrimmed.slice(0, -1) : publicBaseTrimmed)
      : `${LOCAL_API_ORIGIN}${publicBaseTrimmed.startsWith('/') ? publicBaseTrimmed : `/${publicBaseTrimmed}`}`
    return forceProdIfDeployed(resolved, false)
  }

  // Production build: always use production API
  return publicBaseTrimmed.startsWith('http')
    ? (publicBaseTrimmed.endsWith('/') ? publicBaseTrimmed.slice(0, -1) : publicBaseTrimmed)
    : PROD_PUBLIC_BASE
}


