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

const forceProdIfDeployed = (url: string): string => {
  try {
    const parsed = new URL(url);
    const runtimeLocation = getRuntimeLocation();
    const isRuntimeProduction = runtimeLocation && !isLocalHostname(runtimeLocation.hostname);
    const isRuntimeHttps = runtimeLocation && runtimeLocation.protocol === 'https:';
    
    // If running on production domain (HTTPS), ensure API URL is also HTTPS
    if (isRuntimeProduction && isRuntimeHttps) {
      // If API URL is localhost, force to production
      if (isLocalHostname(parsed.hostname)) {
        console.warn('[api] Detected production origin but API URL points to localhost. Forcing production API domain.', {
          runtimeHost: runtimeLocation.hostname,
          previousApiHost: parsed.hostname,
          forced: PROD_API_ORIGIN,
        });
        return PROD_API_ORIGIN;
      }
      // If API URL is production but uses HTTP, force to HTTPS
      if (parsed.hostname.includes('timeliteclothing.com') && parsed.protocol === 'http:') {
        parsed.protocol = 'https:';
        const httpsUrl = parsed.toString().replace(/\/+$/, '');
        console.warn('[api] Detected HTTP API URL on HTTPS production site. Forcing HTTPS.', {
          runtimeHost: runtimeLocation.hostname,
          previousUrl: url,
          forced: httpsUrl,
        });
        return httpsUrl;
      }
    }
    
    // If not production, return as is
    if (!isLocalHostname(parsed.hostname)) {
      return url;
    }
    
    return url;
  } catch {
    return url;
  }
};

const resolveAdminBaseUrl = (): string => {
  const defaultOrigin = PROD_ADMIN_ORIGIN;
  const normalized = normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_ADMIN_URL, defaultOrigin);
  return forceProdIfDeployed(normalized);
};

const resolveApiBaseUrl = (): string => {
  const envOverride = process.env.NEXT_PUBLIC_API_URL;
  
  // Default cho development: dùng gateway port 3002 (không phải admin port 3001)
  const isDev = process.env.NODE_ENV === 'development';
  const defaultOrigin = isDev ? 'http://localhost:3002' : PROD_API_ORIGIN;
  
  const base = envOverride?.trim() ? normalizeAbsoluteUrl(envOverride, envOverride.trim()) : defaultOrigin;
  // Nếu build runtime đang ở production domain nhưng env vẫn để localhost, chuyển sang domain chính
  let resolved = forceProdIfDeployed(base);
  
  // Client side API không nên có /admin prefix - loại bỏ nếu có
  // Admin API dùng ADMIN_BASE_URL riêng, client API dùng BASE_URL không có /admin
  try {
    const url = new URL(resolved);
    if (url.pathname.startsWith('/admin')) {
      // Loại bỏ /admin khỏi pathname
      url.pathname = url.pathname.replace(/^\/admin\/?/, '') || '/';
      resolved = url.toString().replace(/\/+$/, '');
    }
    // Nếu đang ở localhost nhưng port là 3001 (admin), chuyển sang 3002 (gateway)
    if (isLocalHostname(url.hostname) && url.port === '3001' && !url.pathname.startsWith('/admin')) {
      url.port = '3002';
      resolved = url.toString().replace(/\/+$/, '');
    }
  } catch {
    // Nếu không parse được URL, giữ nguyên
  }
  
  return resolved;
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
