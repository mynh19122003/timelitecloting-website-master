// API Configuration
// Resolve and normalize Admin base URL to avoid common misconfiguration (3001 vs 3002)
const normalizeAdminBaseUrl = (input: string): string => {
  try {
    const url = new URL(input);
    // Auto-correct common mistake: using 3001 (API) for admin media
    if (url.hostname === 'localhost' && url.port === '3001' && process.env.NEXT_PUBLIC_ADMIN_STRICT !== 'true') {
      const corrected = `http://${url.hostname}:3002`;
      // Log once for visibility in browser console
      // eslint-disable-next-line no-console
      console.warn('[media] ADMIN_BASE_URL appears to point to :3001. Auto-correcting to :3002. Set NEXT_PUBLIC_ADMIN_STRICT=true to disable.', { from: input, to: corrected });
      return corrected;
    }
    return input;
  } catch {
    return input || 'http://localhost:3002';
  }
};

const RAW_ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
const RESOLVED_ADMIN_BASE = normalizeAdminBaseUrl(RAW_ADMIN_BASE);

export const API_CONFIG = {
  // Base URL for API calls (Gateway listens at 3001)
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  // Admin base for media (images served by admin at 3002)
  ADMIN_BASE_URL: RESOLVED_ADMIN_BASE,
  
  // API endpoints
  ENDPOINTS: {
    // User endpoints
    LOGIN: '/api/node/users/login',
    REGISTER: '/api/node/users/register',
    PROFILE: '/api/node/users/profile',
    CHANGE_PASSWORD: '/api/node/users/change-password',
    
    // Product endpoints
    PRODUCTS: '/api/php/products',
    PRODUCT_DETAIL: '/api/php/products',
    
    // Order endpoints
    ORDERS: '/api/node/orders',
    ORDER_HISTORY: '/api/node/orders/history',
    
    // Fallback PHP endpoints
    PHP: {
      LOGIN: '/api/php/users/login',
      REGISTER: '/api/php/users/register',
      PROFILE: '/api/php/users/profile',
      CHANGE_PASSWORD: '/api/php/users/change-password',
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

// Helper to build admin media URL, e.g. http://localhost:3002/admin/media/PID00001/main.webp
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

// Normalize any media-like URL so it points to the correct admin host
// - If it starts with /admin/media, prefix ADMIN_BASE_URL
// - If it points to localhost:3001/admin/media, rewrite to localhost:3002
// - Keep other hosts untouched
export const normalizePossibleMediaUrl = (input: string | undefined | null): string => {
  const value = String(input ?? '').trim();
  if (!value) return '';
  try {
    if (value.startsWith('/admin/media/')) {
      return `${API_CONFIG.ADMIN_BASE_URL}${value}`;
    }
    if (/^https?:\/\//i.test(value)) {
      const u = new URL(value);
      if (u.hostname === 'localhost' && u.port === '3001' && u.pathname.startsWith('/admin/media/')) {
        u.port = '3002';
        u.protocol = 'http:'; // ensure http for local admin
        return u.toString();
      }
      return value;
    }
  } catch {
    // fallthrough to return original
  }
  return value;
};
