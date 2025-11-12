// API Configuration
// Normalize Admin base URL. We standardize to port 3001 for admin media in dev.
const normalizeAdminBaseUrl = (input: string): string => {
  try {
    const url = new URL(input);
    if (url.hostname === 'localhost') {
      // Force port 3001 as the single source for admin media
      url.protocol = 'http:';
      url.port = '3001';
      return url.toString().replace(/\/+$/, '');
    }
    return input.replace(/\/+$/, '');
  } catch {
    return 'http://localhost:3001';
  }
};

const RAW_ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
const RESOLVED_ADMIN_BASE = normalizeAdminBaseUrl(RAW_ADMIN_BASE);

// Resolve API base URL - supports both Docker (port 3002) and local dev
const resolveApiBaseUrl = (): string => {
  // Check if explicit URL is provided
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.trim();
  }
  
  // In development, check if we're running in Docker context
  // Docker gateway runs on port 3002, but we need to handle both cases
  const isDev = process.env.NODE_ENV === 'development' || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost');
  
  if (isDev) {
    // Use port 3002 for Docker gateway
    // Since we use output: 'export', we need absolute URL
    // Default to port 3002 for Docker gateway
    return 'http://localhost:3002';
  }
  
  // Production: use relative path or configured URL
  return fromEnv || 'http://localhost:3002';
};

export const API_CONFIG = {
  // Base URL for API calls (Gateway listens at port 3002 in Docker)
  BASE_URL: resolveApiBaseUrl(),
  // Admin base for media (images served by admin at 3001)
  ADMIN_BASE_URL: RESOLVED_ADMIN_BASE,
  
  // API endpoints
  ENDPOINTS: {
    // User endpoints
    LOGIN: '/api/node/users/login',
    REGISTER: '/api/node/users/register',
    PROFILE: '/api/node/users/profile',
    CHANGE_PASSWORD: '/api/node/users/change-password',
    FORGOT_PASSWORD: '/api/node/users/forgot-password',
    RESET_PASSWORD: '/api/node/users/reset-password',
    
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

// Helper to build admin media URL, e.g. http://localhost:3001/admin/media/PID00001/main.webp
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
// - If it points to localhost:3002/admin/media, rewrite to localhost:3001
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
      if (u.hostname === 'localhost' && u.port === '3002' && u.pathname.startsWith('/admin/media/')) {
        u.port = '3001';
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
