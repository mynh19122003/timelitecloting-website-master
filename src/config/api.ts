// API Configuration
// Resolve and normalize Admin base URL to avoid common misconfiguration (3001 vs 3002)
// Also normalize Public API base URL to ensure localhost uses :3001 by default
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

// Ensure API base URL points to gateway on :3001 when using localhost without a port
const normalizeApiBaseUrl = (input: string): string => {
  try {
    const url = new URL(input);
    if (url.hostname === 'localhost' && (!url.port || url.port === '80')) {
      const corrected = `http://${url.hostname}:3001`;
      // eslint-disable-next-line no-console
      console.warn('[api] NEXT_PUBLIC_API_URL has no port. Auto-correcting to :3001. Set explicitly to silence this.', { from: input, to: corrected });
      return corrected;
    }
    return input;
  } catch {
    return input || 'http://localhost:3001';
  }
};

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const RESOLVED_API_BASE = normalizeApiBaseUrl(RAW_API_BASE);

export const API_CONFIG = {
  // Base URL for API calls (via gateway)
  BASE_URL: RESOLVED_API_BASE,
  // Admin base for media (images served by admin at 3002)
  ADMIN_BASE_URL: RESOLVED_ADMIN_BASE,
  
  // API endpoints
  ENDPOINTS: {
    // User endpoints (prefixed with /user/api)
    LOGIN: '/user/api/node/users/login',
    REGISTER: '/user/api/node/users/register',
    PROFILE: '/user/api/node/users/profile',
    CHANGE_PASSWORD: '/user/api/node/users/change-password',
    FORGOT_PASSWORD: '/user/api/node/users/forgot-password',
    RESET_PASSWORD: '/user/api/node/users/reset-password',
    
    // Product endpoints (PHP)
    PRODUCTS: '/user/api/php/products',
    PRODUCT_DETAIL: '/user/api/php/products',
    
    // Order endpoints
    ORDERS: '/user/api/node/orders',
    ORDER_HISTORY: '/user/api/node/orders/history',
    
    // Fallback PHP endpoints
    PHP: {
      LOGIN: '/user/api/php/users/login',
      REGISTER: '/user/api/php/users/register',
      PROFILE: '/user/api/php/users/profile',
      CHANGE_PASSWORD: '/user/api/php/users/change-password',
      FORGOT_PASSWORD: '/user/api/php/users/forgot-password',
      RESET_PASSWORD: '/user/api/php/users/reset-password',
      PRODUCTS: '/user/api/php/products',
      PRODUCT_DETAIL: '/user/api/php/products',
      ORDERS: '/user/api/php/orders',
      ORDER_HISTORY: '/user/api/php/orders/history',
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

// Helper to build admin media URL, e.g. http://localhost:3001/admin/admindata/picture/PID00001/main.webp
export const getAdminMediaUrl = (productsId: string, fileName: string = 'main.webp'): string => {
  const pid = encodeURIComponent(productsId);
  const file = encodeURIComponent(fileName);
  // Use port 3001 (gateway) for media requests
  const baseUrl = API_CONFIG.BASE_URL; // This is already http://localhost:3001
  const url = `${baseUrl}/admin/admindata/picture/${pid}/${file}`;
  console.log('[media] getAdminMediaUrl', { base: baseUrl, productsId, fileName, pid, file, url });
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
// - If it starts with /admin/admindata/picture, prefix with BASE_URL (port 3001)
// - Support new format: /admin/admindata/picture/<PID>/main.webp
// - Keep other hosts untouched
export const normalizePossibleMediaUrl = (input: string | undefined | null): string => {
  const value = String(input ?? '').trim();
  if (!value) return '';
  try {
    if (value.startsWith('/admin/admindata/picture/')) {
      // Use BASE_URL (port 3001) for media requests
      return `${API_CONFIG.BASE_URL}${value}`;
    }
    // Support old format for backward compatibility
    if (value.startsWith('/admin/media/')) {
      // Convert old format to new format
      const oldPath = value.replace('/admin/media/admin/data/picture/', '/admin/admindata/picture/');
      return `${API_CONFIG.BASE_URL}${oldPath}`;
    }
    if (/^https?:\/\//i.test(value)) {
      const u = new URL(value);
      // If it's localhost with /admin/admindata/picture/ path, ensure it uses port 3001
      if (u.hostname === 'localhost' && u.pathname.startsWith('/admin/admindata/picture/')) {
        u.port = '3001';
        u.protocol = 'http:';
        return u.toString();
      }
      // Support old format conversion
      if (u.hostname === 'localhost' && u.pathname.startsWith('/admin/media/')) {
        u.pathname = u.pathname.replace('/admin/media/admin/data/picture/', '/admin/admindata/picture/');
        u.port = '3001';
        u.protocol = 'http:';
        return u.toString();
      }
      return value;
    }
    // If it's a relative path like "PID00001/main.webp", convert to full URL
    if (!value.includes('/') && value.match(/^PID\d+$/i)) {
      return getAdminMediaUrl(value);
    }
  } catch {
    // fallthrough to return original
  }
  return value;
};
