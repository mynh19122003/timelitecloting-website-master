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
// Helper: Check if hostname is localhost
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]'])
const isLocalHostname = (hostname) => {
  if (!hostname) return false
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase())
}

// REMOVED: forceProdIfDeployed - runtime detection removed to force API subdomain

export const getApiBaseUrl = () => {
  // FORCE: Always use production API subdomain for admin
  return PROD_ADMIN_BASE
}

// Resolve Public API base URL (catalog/orders)
export const getPublicApiBaseUrl = () => {
  // FORCE: Always use production API subdomain for public API calls from admin
  return PROD_PUBLIC_BASE
}


