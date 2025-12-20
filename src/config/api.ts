// API hosts for different environments
// NOTE: Theo yêu cầu production, frontend LUÔN trỏ về domain API chính thức.
// Nếu muốn override cho môi trường đặc biệt, hãy dùng biến môi trường.
const PROD_API_ORIGIN = 'https://api.timeliteclothing.com';
const PROD_ADMIN_ORIGIN = 'https://api.timeliteclothing.com';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

const isLocalHostname = (hostname: string | undefined | null): boolean => {
  if (!hostname) return false;
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase());
};

const getRuntimeLocation = (): Location | null => {
  if (typeof window !== 'undefined' && window.location) return window.location;
  if (typeof globalThis !== 'undefined' && typeof (globalThis as { location?: Location }).location !== 'undefined') {
    return (globalThis as { location?: Location }).location ?? null;
  }
  return null;
};

const normalizeAbsoluteUrl = (input: string | undefined | null, fallback: string): string => {
  const trimmed = (input || '').trim();
  if (!trimmed) return fallback;
  try {
    const url = new URL(trimmed);
    // Remove trailing slash to keep consistent concatenation later
    return url.toString().replace(/\/+$/, '');
  } catch {
    return fallback;
  }
};

// REMOVED: forceProdIfDeployed() - runtime detection không hoạt động đúng với static export
// Production URL sẽ được hardcode dựa trên NODE_ENV


const resolveAdminBaseUrl = (): string => {
  // FORCE: LUÔN LUÔN dùng production API subdomain
  // Không check NODE_ENV, không check env variables
  return PROD_ADMIN_ORIGIN;
};

const resolveApiBaseUrl = (): string => {
  // Check if running on localhost for development testing
  const loc = getRuntimeLocation();
  if (loc && isLocalHostname(loc.hostname)) {
    // Local development: use Docker gateway
    return 'http://localhost:3002';
  }
  // Production: use production API
  return PROD_API_ORIGIN;
};

const RESOLVED_ADMIN_BASE = resolveAdminBaseUrl();

export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: resolveApiBaseUrl(),
  // Admin base for media (images served by admin)
  ADMIN_BASE_URL: RESOLVED_ADMIN_BASE,

  // API endpoints
  ENDPOINTS: {
    // User endpoints (use PHP auth in current setup to avoid Node 404s)
    LOGIN: '/api/php/users/login',
    REGISTER: '/api/php/users/register',
    PROFILE: '/api/php/users/profile',
    CHANGE_PASSWORD: '/api/php/users/change-password',
    FORGOT_PASSWORD: '/api/php/users/forgot-password',
    RESET_PASSWORD: '/api/php/users/reset-password',

    // Product endpoints
    PRODUCTS: '/api/php/products',
    PRODUCT_DETAIL: '/api/php/products',

    // Order endpoints (route directly to PHP backend)
    ORDERS: '/api/php/orders',
    ORDER_HISTORY: '/api/php/orders/history',
    CONTACT: '/api/contact',

    // Fallback PHP endpoints
    PHP: {
      LOGIN: '/api/php/users/login',
      REGISTER: '/api/php/users/register',
      PROFILE: '/api/php/users/profile',
      CHANGE_PASSWORD: '/api/php/users/change-password',
      FORGOT_PASSWORD: '/api/php/users/forgot-password',
      RESET_PASSWORD: '/api/php/users/reset-password',
      PRODUCTS: '/api/php/products',
      PRODUCT_DETAIL: '/api/php/products',
      ORDERS: '/api/php/orders',
      ORDER_HISTORY: '/api/php/orders/history',
    }
  },

  // Request timeout (in milliseconds)
  TIMEOUT: 10000,

  // Retry configuration
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000,
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get PHP fallback URL
export const getPhpApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper to build admin media URL, e.g. https://api.timeliteclothing.com/admin/media/PID00001/main.webp
export const getAdminMediaUrl = (productsId: string, fileName: string = 'main.webp'): string => {
  const pid = encodeURIComponent(productsId);
  const file = encodeURIComponent(fileName);
  const url = `${API_CONFIG.ADMIN_BASE_URL}/admin/media/${pid}/${file}`;
  console.log('[media] getAdminMediaUrl', { base: API_CONFIG.ADMIN_BASE_URL, productsId, fileName, pid, file, url });
  return url;
};

// Convert a variety of backend identifiers to the canonical PID code (e.g., PID00001)
export const toProductsPid = (value: unknown): string | undefined => {
  if (value == null) {
    console.log('[media] toProductsPid: nullish', { value });
    return undefined;
  }
  const raw = String(value).trim();
  if (!raw) {
    console.log('[media] toProductsPid: empty', { value });
    return undefined;
  }
  // Already in PID format
  const pidMatch = /^pid\d+$/i.test(raw);
  if (pidMatch) {
    const result = raw.toUpperCase();
    console.log('[media] toProductsPid: pidMatch', { value, raw, result });
    return result;
  }
  // Extract digits and pad
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) {
    console.log('[media] toProductsPid: noDigits', { value, raw });
    return undefined;
  }
  const result = `PID${digitsOnly.padStart(5, '0')}`;
  console.log('[media] toProductsPid: built', { value, raw, digitsOnly, result });
  return result;
};

// Convenience: build media URL from any id-like value
export const getAdminMediaUrlByAny = (idLike: unknown, fileName: string = 'main.webp'): string | undefined => {
  const pid = toProductsPid(idLike);
  const url = pid ? getAdminMediaUrl(pid, fileName) : undefined;
  console.log('[media] getAdminMediaUrlByAny', { idLike, fileName, pid, url });
  return url;
};

// Normalize any media-like URL so it points to the configured admin host
// - If it starts with /admin/media, prefix ADMIN_BASE_URL
// - If it is an absolute URL that already hits /admin/media, force it to ADMIN_BASE_URL
// - Keep other hosts untouched
export const normalizePossibleMediaUrl = (input: string | undefined | null): string => {
  const value = String(input ?? '').trim();
  if (!value) return '';
  const adminBaseUrl = API_CONFIG.ADMIN_BASE_URL;
  try {
    if (value.startsWith('/admin/media/')) {
      return `${adminBaseUrl}${value}`;
    }
    if (/^https?:\/\//i.test(value)) {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith('/admin/media/')) {
        return `${adminBaseUrl}${parsed.pathname}`;
      }
      return value;
    }
  } catch {
    // fallthrough to return original
  }
  return value;
};
