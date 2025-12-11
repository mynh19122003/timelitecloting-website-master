import { API_CONFIG, getAdminMediaUrl } from '../config/api';
import logger from '../utils/logger';
import { apiCache, ApiCache } from '../utils/apiCache';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  user_code: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ContactRequestPayload {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  message: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    silent: boolean = false
  ): Promise<T> {
    try {
      const apiDisabledByEnv = process.env.NEXT_PUBLIC_API_DISABLED === '1';
      const apiDisabledByStorage = (typeof window !== 'undefined') && (window.localStorage.getItem('timelite:disable-api') === '1');
      if (apiDisabledByEnv || apiDisabledByStorage) {
        throw new ApiError('API is disabled on frontend (enable by removing NEXT_PUBLIC_API_DISABLED or localStorage timelite:disable-api)', 0, 'API_DISABLED');
      }
    } catch {
      // ignore errors when checking localStorage for API disable flag
    }
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    if (!silent) {
      let parsedBody: unknown = undefined;
      try {
        if (options.body) {
          parsedBody = JSON.parse(options.body as string);
          // Special logging for order creation requests
          if (typeof parsedBody === 'object' && parsedBody !== null && 'items' in parsedBody) {
            console.log('[HttpClient] 🛒 ORDER REQUEST DETECTED:');
            console.log('[HttpClient] Full request body:', JSON.stringify(parsedBody, null, 2));
            const items = (parsedBody as { items?: unknown[] }).items || [];
            console.log('[HttpClient] Items count:', items.length);
            items.forEach((item: unknown, index: number) => {
              console.log(`[HttpClient]   Item #${index + 1}:`, JSON.stringify(item, null, 2));
            });
          }
        }
      } catch (e) {
        console.warn('[HttpClient] Could not parse request body as JSON:', e);
        parsedBody = options.body;
      }

      console.log('[HttpClient] REQUEST:', {
        url,
        method: options.method || 'GET',
        hasToken: !!token,
        body: parsedBody
      });
    }

    const timeout = API_CONFIG.TIMEOUT || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text || 'An error occurred' };
        }
      }

      if (!silent) {
        console.log('[HttpClient] RESPONSE:', {
          url,
          status: response.status,
          ok: response.ok,
          data
        });
      }

      if (!response.ok) {
        // Log error using logger utility
        logger.logApiError(url, response.status, data, {
          method: options.method || 'GET',
          requestBody: options.body ? JSON.parse(options.body as string) : undefined,
        });

        // Extract error message from various response formats
        let errorMessage = 'An error occurred';
        if (data && typeof data === 'object') {
          // Check for validation error messages
          if ('message' in data && typeof data.message === 'string') {
            errorMessage = data.message;
          } else if ('error' in data) {
            if (typeof data.error === 'string') {
              errorMessage = data.error;
            } else if (data.error && typeof data.error === 'object' && 'message' in data.error) {
              errorMessage = String(data.error.message);
            }
          }
          // Check for validation errors array
          if ('errors' in data && Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((e: unknown) =>
              typeof e === 'string' ? e : (e && typeof e === 'object' && 'message' in e ? String(e.message) : '')
            ).filter(Boolean).join(', ');
          }
        }

        throw new ApiError(
          errorMessage,
          response.status,
          data && typeof data === 'object' && 'error' in data ? String(data.error) : undefined
        );
      }

      return data as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Log error details for debugging
      const errorInfo: {
        url: string;
        errorType: string;
        errorMessage: string;
        errorName: string;
        errorStack?: string;
        errorObject?: unknown;
      } = {
        url,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : (error && typeof error === 'object'
          ? JSON.stringify(error)
          : String(error || 'Unknown error')),
        errorName: error instanceof Error ? error.name : 'Unknown',
      };

      if (error instanceof Error && error.stack) {
        errorInfo.errorStack = error.stack;
      }

      if (error && typeof error === 'object') {
        try {
          errorInfo.errorObject = JSON.parse(JSON.stringify(error));
        } catch {
          errorInfo.errorObject = error;
        }
      } else {
        errorInfo.errorObject = error;
      }

      console.error('[HttpClient] Request error caught:', errorInfo);

      if (error instanceof ApiError) {
        // Already logged, just throw
        throw error;
      }

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new ApiError(
          `Request timeout after ${timeout}ms. Backend server có thể không phản hồi.`,
          0,
          'TIMEOUT'
        );
        logger.logNetworkError(url, timeoutError);
        throw timeoutError;
      }

      // Network or other errors - provide helpful message
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const errorMessage = isNetworkError
        ? 'Không thể kết nối đến backend server. Vui lòng đảm bảo backend đang chạy:\n1. cd ecommerce-backend\n2. docker-compose up -d\nHoặc kiểm tra NEXT_PUBLIC_API_URL trong .env.local'
        : (error instanceof Error ? error.message : 'Network error. Please check your connection.');

      const networkError = new ApiError(errorMessage, 0);
      logger.logNetworkError(url, networkError);
      throw networkError;
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('timelite:jwt-token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('timelite:jwt-token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('timelite:jwt-token');
  }

  // Public methods
  async get<T>(endpoint: string, silent: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, silent);
  }

  async post<T>(endpoint: string, data?: unknown, silent: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, silent);
  }

  async put<T>(endpoint: string, data?: unknown, silent: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, silent);
  }

  async delete<T>(endpoint: string, silent: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, silent);
  }

  // Token management
  saveToken(token: string): void {
    this.setToken(token);
  }

  clearToken(): void {
    this.removeToken();
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  getAuthToken(): string | null {
    return this.getToken();
  }
}

// Create HTTP client instance
const httpClient = new HttpClient();

// API Service class
export class ApiService {
  // User Authentication
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Try Node.js backend first (qua Gateway / domain API chính)
      const response = await httpClient.post<ApiResponse<LoginResponse>>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      const loginData = response.data || (response as unknown as LoginResponse);
      httpClient.saveToken(loginData.token);
      return loginData;
    } catch (error) {
      // Fallback sang PHP backend nếu Node.js lỗi
      try {
        const response = await httpClient.post<ApiResponse<LoginResponse>>(API_CONFIG.ENDPOINTS.PHP.LOGIN, credentials);
        const loginData = response.data || (response as unknown as LoginResponse);
        httpClient.saveToken(loginData.token);
        return loginData;
      } catch {
        // Nếu tất cả đều lỗi, ném error gốc
        throw error;
      }
    }
  }

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Try Node.js backend first
      const payload = { email: userData.email, password: userData.password };
      const response = await httpClient.post<ApiResponse<RegisterResponse>>(API_CONFIG.ENDPOINTS.REGISTER, payload);
      const registerData = response.data || (response as unknown as RegisterResponse);
      httpClient.saveToken(registerData.token);
      return registerData;
    } catch (error) {
      // Fallback to PHP backend
      try {
        const payload = { email: userData.email, password: userData.password };
        const response = await httpClient.post<ApiResponse<RegisterResponse>>(API_CONFIG.ENDPOINTS.PHP.REGISTER, payload);
        const registerData = response.data || (response as unknown as RegisterResponse);
        httpClient.saveToken(registerData.token);
        return registerData;
      } catch {
        // If both fail, throw the original error
        throw error;
      }
    }
  }

  static async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      // Try Node.js backend first
      return await httpClient.put<ApiResponse>(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData);
    } catch (error) {
      // Fallback to PHP backend
      try {
        return await httpClient.put<ApiResponse>(API_CONFIG.ENDPOINTS.PHP.CHANGE_PASSWORD, passwordData);
      } catch {
        // If both fail, throw the original error
        throw error;
      }
    }
  }

  static async getProfile(): Promise<User> {
    const mapUser = (u: User & { user_name?: string; user_phone?: string; user_address?: string }): User => ({
      id: u.id,
      user_code: u.user_code,
      email: u.email,
      name: u.user_name ?? u.name,
      phone: u.user_phone ?? u.phone,
      address: u.user_address ?? u.address,
      created_at: u.created_at,
      updated_at: u.updated_at,
    });

    try {
      // Gọi profile qua Node.js backend (qua domain API chính)
      const res = await httpClient.get<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PROFILE, true);
      const data = (res.data ?? res) as User;
      return mapUser(data);
    } catch (error) {
      // Fallback sang PHP backend nếu Node.js lỗi
      try {
        const res = await httpClient.get<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PHP.PROFILE, true);
        const data = (res.data ?? res) as User;
        return mapUser(data);
      } catch {
        throw error; // Giữ nguyên error gốc nếu tất cả đều lỗi
      }
    }
  }

  static async updateProfile(payload: { name?: string; phone?: string; address?: string; }): Promise<User> {
    const body: {
      user_name?: string;
      user_phone?: string;
      user_address?: string;
    } = {
      user_name: payload.name,
      user_phone: payload.phone,
      user_address: payload.address,
    };

    const mapUser = (u: User & { user_name?: string; user_phone?: string; user_address?: string }): User => ({
      id: u.id,
      user_code: u.user_code,
      email: u.email,
      name: u.user_name ?? u.name,
      phone: u.user_phone ?? u.phone,
      address: u.user_address ?? u.address,
      created_at: u.created_at,
      updated_at: u.updated_at,
    });

    try {
      const res = await httpClient.put<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PROFILE, body);
      const data = (res.data ?? res) as User;
      return mapUser(data);
    } catch {
      const res = await httpClient.put<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PHP.PROFILE, body);
      const data = (res.data ?? res) as User;
      return mapUser(data);
    }
  }

  // Products
  static async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    variant?: string;
    sortBy?: 'price' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }, useCache: boolean = true): Promise<{
    products: unknown[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.variant) queryParams.append('variant', params.variant);

    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}${queryString ? `?${queryString}` : ''}`;
    const cacheKey = ApiCache.generateKey(endpoint, params);

    if (useCache && !params?.search) {
      const cached = apiCache.get<{
        products: unknown[];
        total: number;
        page: number;
        limit: number;
      }>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const res = await httpClient.get<ApiResponse<unknown>>(endpoint, true);
      const data = (res as ApiResponse<unknown>).data ?? res;
      const pagination = (data as { pagination?: { page?: number; limit?: number; total?: number }; total?: number })?.pagination
        ?? { page: Number(params?.page || 1), limit: Number(params?.limit || 10), total: (data as { total?: number })?.total ?? 0 };
      const result = {
        products: (data as { products?: unknown[] }).products ?? [],
        total: Number(pagination.total ?? 0),
        page: Number(pagination.page ?? 1),
        limit: Number(pagination.limit ?? 10),
      };

      if (useCache && !params?.search) {
        apiCache.set(cacheKey, result, 2 * 60 * 1000);
      }

      return result;
    } catch {
      try {
        const res = await httpClient.get<ApiResponse<unknown>>(`${API_CONFIG.ENDPOINTS.PHP.PRODUCTS}${queryString ? `?${queryString}` : ''}`, true);
        const data = (res as ApiResponse<unknown>).data ?? res;
        const pagination = (data as { pagination?: { page?: number; limit?: number; total?: number }; total?: number })?.pagination
          ?? { page: Number(params?.page || 1), limit: Number(params?.limit || 10), total: (data as { total?: number })?.total ?? 0 };
        const result = {
          products: (data as { products?: unknown[] }).products ?? [],
          total: Number(pagination.total ?? 0),
          page: Number(pagination.page ?? 1),
          limit: Number(pagination.limit ?? 10),
        };

        if (useCache && !params?.search) {
          apiCache.set(cacheKey, result, 2 * 60 * 1000);
        }

        return result;
      } catch {
        return { products: [], total: 0, page: Number(params?.page || 1), limit: Number(params?.limit || 10) };
      }
    }
  }

  static async getProduct(idOrSlug: number | string, useCache: boolean = true): Promise<unknown> {
    const idStr = String(idOrSlug);
    const cacheKey = `product:${idStr}`;

    if (useCache) {
      const cached = apiCache.get<unknown>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const pidMatch = /^pid(\d+)$/i.test(idStr);
    if (pidMatch) {
      const numericIdMatch = idStr.match(/^pid(\d+)$/i)?.[1];
      if (numericIdMatch) {
        // Use full PID string as requested by user
        // const numericId = parseInt(numericIdMatch, 10);
        try {
          const result = await httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL}/${idStr}`);
          if (useCache) {
            apiCache.set(cacheKey, result, 5 * 60 * 1000);
          }
          return result;
        } catch {
          const result = await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.PRODUCT_DETAIL}/${idStr}`);
          if (useCache) {
            apiCache.set(cacheKey, result, 5 * 60 * 1000);
          }
          return result;
        }
      }
    }

    const isNumeric = typeof idOrSlug === 'number' || (typeof idOrSlug === 'string' && /^\d+$/.test(idStr));
    if (isNumeric) {
      try {
        const result = await httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL}/${idOrSlug}`);
        if (useCache) {
          apiCache.set(cacheKey, result, 5 * 60 * 1000);
        }
        return result;
      } catch {
        const result = await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.PRODUCT_DETAIL}/${idOrSlug}`);
        if (useCache) {
          apiCache.set(cacheKey, result, 5 * 60 * 1000);
        }
        return result;
      }
    }

    const slug = idStr;
    const result = await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.PRODUCT_DETAIL}?product_id=${encodeURIComponent(slug)}`);
    if (useCache) {
      apiCache.set(cacheKey, result, 5 * 60 * 1000);
    }
    return result;
  }

  static async getProductBySlug(slug: string): Promise<unknown> {
    return this.getProduct(slug);
  }

  // Get related products by category (excluding current product)
  static async getRelatedProducts(
    category: string,
    excludeProductId?: string | number,
    limit: number = 3
  ): Promise<unknown[]> {
    try {
      // Convert category slug to API label if needed
      // API expects labels like "Accessories", "Ao Dai Couture", etc.
      // Frontend uses slugs like "conical-hats", "ao-dai", etc.
      let apiCategory = category;
      const categoryLabelMap: Record<string, string> = {
        'ao-dai': 'Ao Dai Couture',
        'vest': 'Tailored Suiting',
        'wedding': 'Bridal Gowns',
        'evening': 'Evening Dresses',
        'conical-hats': 'Accessories', // Database uses "Accessories" not "Conical Hats"
        'kidswear': 'Kidswear',
        'gift-procession-sets': 'Gift Procession Sets',
      };

      // If category is a slug, convert to label
      const lowerCategory = category.toLowerCase();
      if (categoryLabelMap[lowerCategory]) {
        apiCategory = categoryLabelMap[lowerCategory];
      }

      // Build query params - request more to account for filtering
      const requestLimit = excludeProductId ? Math.max(limit * 2, 20) : limit;
      const queryParams = new URLSearchParams();
      queryParams.append('category', apiCategory);
      queryParams.append('limit', String(requestLimit));

      const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?${queryParams.toString()}`;

      const res = await httpClient.get<ApiResponse<unknown>>(endpoint, true);
      const data = (res as ApiResponse<unknown>).data ?? res;
      const products = (data as { products?: unknown[] }).products ?? [];

      // Filter out current product if excludeProductId is provided
      let filtered = products;
      if (excludeProductId) {
        const excludeIdStr = String(excludeProductId);
        filtered = products.filter((p: unknown) => {
          const product = p as {
            id?: number | string;
            product_id?: string;
            slug?: string;
            products_id?: string | number;
          };
          const productId = String(
            product.id ??
            product.product_id ??
            product.slug ??
            product.products_id ??
            ''
          );
          return productId !== excludeIdStr;
        });
      }

      // Return limited results
      return filtered.slice(0, limit);
    } catch (error) {
      console.error('[ApiService] Error getting related products:', error);
      // Fallback to PHP backend
      try {
        // Use same category conversion for fallback
        let apiCategory = category;
        const categoryLabelMap: Record<string, string> = {
          'ao-dai': 'Ao Dai Couture',
          'vest': 'Tailored Suiting',
          'wedding': 'Bridal Gowns',
          'evening': 'Evening Dresses',
          'conical-hats': 'Accessories', // Database uses "Accessories" not "Conical Hats"
          'kidswear': 'Kidswear',
          'gift-procession-sets': 'Gift Procession Sets',
        };

        const lowerCategory = category.toLowerCase();
        if (categoryLabelMap[lowerCategory]) {
          apiCategory = categoryLabelMap[lowerCategory];
        }

        const queryParams = new URLSearchParams();
        queryParams.append('category', apiCategory);
        queryParams.append('limit', String(Math.max(limit * 2, 10)));

        const endpoint = `${API_CONFIG.ENDPOINTS.PHP.PRODUCTS}?${queryParams.toString()}`;
        const res = await httpClient.get<ApiResponse<unknown>>(endpoint, true);
        const data = (res as ApiResponse<unknown>).data ?? res;
        const products = (data as { products?: unknown[] }).products ?? [];

        let filtered = products;
        if (excludeProductId) {
          const excludeIdStr = String(excludeProductId);
          filtered = products.filter((p: unknown) => {
            const product = p as {
              id?: number | string;
              product_id?: string;
              slug?: string;
              products_id?: string | number;
            };
            const productId = String(
              product.id ??
              product.product_id ??
              product.slug ??
              product.products_id ??
              ''
            );
            return productId !== excludeIdStr;
          });
        }

        return filtered.slice(0, limit);
      } catch (fallbackError) {
        console.error('[ApiService] Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Orders
  static async createOrder(orderData: {
    firstname: string;
    lastname: string;
    address: string;
    phonenumber: string;
    payment_method: string;
    items: Array<{
      products_id?: string;
      product_id?: number;
      product_slug?: string;
      quantity: number;
      color?: string;
      size?: string;
    }>;
    total_amount?: number;
    notes?: string;
  }): Promise<unknown> {
    console.log('[ApiService] createOrder called with data:', JSON.stringify(orderData, null, 2));
    console.log('[ApiService] API Base URL:', API_CONFIG.BASE_URL);
    console.log('[ApiService] Primary endpoint:', API_CONFIG.ENDPOINTS.ORDERS);
    console.log('[ApiService] PHP fallback endpoint:', API_CONFIG.ENDPOINTS.PHP.ORDERS);

    try {
      console.log('[ApiService] Trying primary API endpoint:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`);
      const response = await httpClient.post<unknown>(API_CONFIG.ENDPOINTS.ORDERS, orderData);
      console.log('[ApiService] ✅ Primary API response:', response);
      return response;
    } catch (error: unknown) {
      // Extract error message properly
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Check for ApiError format
        if ('message' in error) {
          errorMessage = String((error as { message?: unknown }).message);
        } else if ('error' in error) {
          errorMessage = String((error as { error?: unknown }).error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else {
        errorMessage = String(error || 'Unknown error');
      }

      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : (error && typeof error === 'object' ? error : { error });

      console.error('[ApiService] ❌ Primary API failed:', errorMessage);
      console.error('[ApiService] Primary API error details:', errorDetails);

      // Fallback to PHP backend
      try {
        console.log('[ApiService] Falling back to PHP backend:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PHP.ORDERS}`);
        const phpResponse = await httpClient.post<unknown>(API_CONFIG.ENDPOINTS.PHP.ORDERS, orderData);
        console.log('[ApiService] ✅ PHP backend response:', phpResponse);
        return phpResponse;
      } catch (phpError: unknown) {
        const phpErrorMessage = phpError instanceof Error ? phpError.message : String(phpError);
        const phpErrorDetails = phpError instanceof Error ? {
          name: phpError.name,
          message: phpError.message,
          stack: phpError.stack
        } : { error: phpError };

        console.error('[ApiService] ❌ PHP backend also failed:', phpErrorMessage);
        console.error('[ApiService] PHP backend error details:', phpErrorDetails);
        throw phpError;
      }
    }
  }

  static async getOrderHistory(): Promise<
    Array<{
      id: number;
      orderNumber: string;
      status: string;
      placedAt: string;
      total: number;
      shippingFee: number;
      subtotal: number;
      paymentMethod: string;
      notes?: string;
      items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
        image: string;
        color: string;
        size: string;
      }>;
    }>
  > {
    // Helper function to parse and transform orders
    const parseOrders = (response: unknown): ReturnType<typeof ApiService.getOrderHistory> extends Promise<infer R> ? R : never => {
      let orders: unknown[] = [];

      // Handle API response format: { success: true, data: { orders: [...], pagination: {...} } }
      if (response && typeof response === 'object') {
        // Check if response has data property
        if ('data' in response && (response as { data?: unknown }).data) {
          // Check if data has orders array
          const data = (response as { data: unknown }).data;
          if (data && typeof data === 'object' && 'orders' in (data as { orders?: unknown })) {
            const ordersField = (data as { orders?: unknown }).orders;
            if (Array.isArray(ordersField)) {
              orders = ordersField;
            }
          }
          // Check if data itself is an array
          else if (Array.isArray(data)) {
            orders = data;
          }
        }
        // Check if response is directly an array
        else if (Array.isArray(response)) {
          orders = response;
        }
      }

      // Transform backend order format to frontend format
      return orders.map((order) => {
        // Prefer structured items if present
        let itemsArr: Array<{
          id: number;
          name: string;
          quantity: number;
          price: number;
          image: string;
          color: string;
          size: string;
        }> = [];
        if (order && typeof order === 'object' && 'products_items' in order && (order as { products_items?: unknown }).products_items) {
          try {
            const raw = typeof (order as { products_items: unknown }).products_items === 'string'
              ? JSON.parse((order as { products_items: string }).products_items)
              : (order as { products_items: unknown }).products_items;
            if (Array.isArray(raw)) {
              itemsArr = raw.map((it, idx: number) => {
                const item = it as {
                  name?: string;
                  qty?: number;
                  quantity?: number;
                  price?: number;
                  products_id?: number | string;
                  color?: string;
                  size?: string;
                };
                return {
                  id: idx + 1,
                  name: item.name ?? 'Unknown product',
                  quantity: item.qty ?? item.quantity ?? 1,
                  price: item.price ?? 0,
                  image: item.products_id ? getAdminMediaUrl(String(item.products_id)) : '/images/placeholder.jpg',
                  color: item.color || 'Default',
                  size: item.size || 'Default',
                };
              });
            }
          } catch { }
        } else if (order && typeof order === 'object' && 'products_name' in order && (order as { products_name?: unknown }).products_name) {
          // Backward compatibility: parse string
          const rawNames = String((order as { products_name: unknown }).products_name);
          itemsArr = rawNames.split(',').map((item: string, index: number) => {
            const match = item.trim().match(/^(.+?)\s+x(\d+)$/);
            if (match) {
              return { id: index + 1, name: match[1], quantity: parseInt(match[2]), price: 0, image: '/images/placeholder.jpg', color: 'Default', size: 'Default' };
            }
            return { id: index + 1, name: item.trim(), quantity: 1, price: 0, image: '/images/placeholder.jpg', color: 'Default', size: 'Default' };
          });
        }

        const o = order as {
          id?: number;
          order_id?: string;
          status?: string;
          create_date?: string;
          created_at?: string;
          total_price?: number;
          products_price?: number;
          payment_method?: string;
          notes?: string;
        };

        return {
          id: o.id ?? 0,
          orderNumber: o.order_id || `ORD${String(o.id ?? '').padStart(5, '0')}`,
          status: o.status || 'pending',
          placedAt: o.create_date || o.created_at || '',
          total: o.total_price ?? o.products_price ?? 0,
          shippingFee: 0,
          subtotal: o.products_price ?? 0,
          paymentMethod: o.payment_method || 'cod',
          notes: o.notes,
          items: itemsArr
        };
      });
    };

    try {
      const response = await httpClient.get<ApiResponse<unknown>>(API_CONFIG.ENDPOINTS.ORDER_HISTORY);
      console.log('[ApiService] getOrderHistory - Raw response:', response);
      return parseOrders(response);
    } catch (error) {
      try {
        const response = await httpClient.get<ApiResponse<unknown>>(API_CONFIG.ENDPOINTS.PHP.ORDER_HISTORY);
        console.log('[ApiService] getOrderHistory - PHP backend response:', response);
        return parseOrders(response);
      } catch {
        console.error('[ApiService] getOrderHistory - Tất cả backends đều thất bại');
        return [];
      }
    }
  }

  static async getOrder(id: number): Promise<unknown> {
    try {
      return await httpClient.get(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
    } catch (error) {
      try {
        return await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.ORDERS}/${id}`);
      } catch {
        throw error; // Throw original error if all fail
      }
    }
  }

  static async submitContactRequest(payload: ContactRequestPayload): Promise<ApiResponse> {
    return httpClient.post<ApiResponse>(API_CONFIG.ENDPOINTS.CONTACT, payload, true);
  }

  // Auth utilities
  static logout(): void {
    httpClient.clearToken();
  }

  static isAuthenticated(): boolean {
    return httpClient.hasToken();
  }

  static getToken(): string | null {
    return httpClient.getAuthToken();
  }
}

// Export default instance
export default ApiService;
