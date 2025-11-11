// API Service for E-commerce Backend
// Tích hợp với Node.js và PHP backend

import { API_CONFIG, getAdminMediaUrl } from '../config/api';

// API Response types
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

// HTTP Client class
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
    // Allow disabling all API calls from FE for manual Postman testing
    try {
      const apiDisabledByEnv = process.env.NEXT_PUBLIC_API_DISABLED === '1';
      const apiDisabledByStorage = (typeof window !== 'undefined') && (window.localStorage.getItem('timelite:disable-api') === '1');
      if (apiDisabledByEnv || apiDisabledByStorage) {
        throw new ApiError('API is disabled on frontend (enable by removing NEXT_PUBLIC_API_DISABLED or localStorage timelite:disable-api)', 0, 'API_DISABLED');
      }
    } catch (_) {
      // ignore storage access errors (SSR)
    }
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add JWT token if available
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    if (!silent) {
      console.log('[HttpClient] REQUEST:', {
        url,
        method: options.method || 'GET',
        hasToken: !!token,
        body: options.body ? JSON.parse(options.body as string) : undefined
      });
    }

    // Add timeout to prevent hanging requests
    const timeout = API_CONFIG.TIMEOUT || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      // Handle non-JSON responses
      let data: any;
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
        throw new ApiError(
          data.message || data.error || 'An error occurred',
          response.status,
          data.error
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (!silent) {
        console.error('[HttpClient] ERROR:', {
          url,
          error: error instanceof Error ? error.message : error,
          isAborted: error instanceof Error && error.name === 'AbortError'
        });
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          `Request timeout after ${timeout}ms. Backend server có thể không phản hồi.`,
          0,
          'TIMEOUT'
        );
      }
      
      // Network or other errors - provide helpful message
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const errorMessage = isNetworkError 
        ? 'Không thể kết nối đến backend server. Vui lòng đảm bảo backend đang chạy:\n1. cd ecommerce-backend\n2. docker-compose up -d\nHoặc kiểm tra NEXT_PUBLIC_API_URL trong .env.local'
        : 'Network error. Please check your connection.';
      
      throw new ApiError(
        errorMessage,
        0
      );
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
      // Try Node.js backend first (via Gateway port 80)
      const response = await httpClient.post<ApiResponse<LoginResponse>>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      const loginData = response.data || response as any;
      httpClient.saveToken(loginData.token);
      return loginData;
    } catch (error) {
      // If Gateway (port 80) fails, try direct Node.js backend (port 3001)
      const isNetworkError = error instanceof ApiError && error.status === 0;
      if (isNetworkError && API_CONFIG.BASE_URL === 'http://localhost') {
        try {
          console.warn('[ApiService] Gateway (port 80) không khả dụng, thử Node.js backend trực tiếp (port 3001)...');
          const directBackendClient = new HttpClient('http://localhost:3001');
          const response = await directBackendClient.post<ApiResponse<LoginResponse>>('/api/node/users/login', credentials);
          const loginData = response.data || response as any;
          httpClient.saveToken(loginData.token);
          return loginData;
        } catch (directError) {
          // Fall through to PHP fallback
        }
      }
      
      // Fallback to PHP backend
      try {
        const response = await httpClient.post<ApiResponse<LoginResponse>>(API_CONFIG.ENDPOINTS.PHP.LOGIN, credentials);
        const loginData = response.data || response as any;
        httpClient.saveToken(loginData.token);
        return loginData;
      } catch {
        // If all fail, throw the original error with helpful message
        throw error;
      }
    }
  }

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Try Node.js backend first
      const payload = { email: userData.email, password: userData.password };
      const response = await httpClient.post<ApiResponse<RegisterResponse>>(API_CONFIG.ENDPOINTS.REGISTER, payload);
      const registerData = response.data || response as any;
      httpClient.saveToken(registerData.token);
      return registerData;
    } catch (error) {
      // Fallback to PHP backend
      try {
        const payload = { email: userData.email, password: userData.password };
        const response = await httpClient.post<ApiResponse<RegisterResponse>>(API_CONFIG.ENDPOINTS.PHP.REGISTER, payload);
        const registerData = response.data || response as any;
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
      } catch (phpError) {
        // If both fail, throw the original error
        throw error;
      }
    }
  }

  static async getProfile(): Promise<User> {
    const mapUser = (u: any): User => ({
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
      // Try Gateway (port 80) first
      const res = await httpClient.get<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PROFILE, true);
      const data = (res as any).data ?? res;
      return mapUser(data);
    } catch (error) {
      // If Gateway (port 80) fails, try direct Node.js backend (port 3001)
      const isNetworkError = error instanceof ApiError && error.status === 0;
      if (isNetworkError && API_CONFIG.BASE_URL === 'http://localhost') {
        try {
          console.warn('[ApiService] Gateway (port 80) không khả dụng, thử Node.js backend trực tiếp (port 3001)...');
          const directBackendClient = new HttpClient('http://localhost:3001');
          const res = await directBackendClient.get<ApiResponse<User>>('/api/node/users/profile', true);
          const data = (res as any).data ?? res;
          return mapUser(data);
        } catch (directError) {
          // Fall through to PHP fallback
        }
      }
      
      // Fallback to PHP backend
      try {
        const res = await httpClient.get<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PHP.PROFILE, true);
        const data = (res as any).data ?? res;
        return mapUser(data);
      } catch (phpError) {
        throw error; // Throw original error if all fail
      }
    }
  }

  static async updateProfile(payload: { name?: string; phone?: string; address?: string; }): Promise<User> {
    const body = {
      user_name: payload.name,
      user_phone: payload.phone,
      user_address: payload.address,
    } as any;

    const mapUser = (u: any): User => ({
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
      const data = (res as any).data ?? res;
      return mapUser(data);
    } catch (err) {
      const res = await httpClient.put<ApiResponse<User>>(API_CONFIG.ENDPOINTS.PHP.PROFILE, body);
      const data = (res as any).data ?? res;
      return mapUser(data);
    }
  }

  // Products
  static async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: 'price' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    products: any[];
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

    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}${queryString ? `?${queryString}` : ''}`;

    try {
      const res = await httpClient.get<ApiResponse<any>>(endpoint, true);
      const data = (res as any).data ?? res;
      const pagination = (data && data.pagination) ? data.pagination : { page: Number(params?.page || 1), limit: Number(params?.limit || 10), total: (data?.total ?? 0) };
      return {
        products: data.products ?? [],
        total: Number(pagination.total ?? 0),
        page: Number(pagination.page ?? 1),
        limit: Number(pagination.limit ?? 10),
      } as any;
    } catch (error) {
      // Fallback to PHP explicitly if not already using it
      try {
        const res = await httpClient.get<ApiResponse<any>>(`${API_CONFIG.ENDPOINTS.PHP.PRODUCTS}${queryString ? `?${queryString}` : ''}`, true);
        const data = (res as any).data ?? res;
        const pagination = (data && data.pagination) ? data.pagination : { page: Number(params?.page || 1), limit: Number(params?.limit || 10), total: (data?.total ?? 0) };
        return {
          products: data.products ?? [],
          total: Number(pagination.total ?? 0),
          page: Number(pagination.page ?? 1),
          limit: Number(pagination.limit ?? 10),
        } as any;
      } catch (_) {
        return { products: [], total: 0, page: Number(params?.page || 1), limit: Number(params?.limit || 10) } as any;
      }
    }
  }

  static async getProduct(idOrSlug: number | string): Promise<any> {
    const idStr = String(idOrSlug);
    
    // Check if it's a PID format (e.g., PID00001)
    const pidMatch = /^pid(\d+)$/i.test(idStr);
    if (pidMatch) {
      // Extract numeric ID from PID format and remove leading zeros
      const numericIdMatch = idStr.match(/^pid(\d+)$/i)?.[1];
      if (numericIdMatch) {
        const numericId = parseInt(numericIdMatch, 10); // Convert to integer, removing leading zeros
        try {
          return await httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL}/${numericId}`);
        } catch (error) {
          return await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.PRODUCT_DETAIL}/${numericId}`);
        }
      }
    }
    
    // Check if it's a numeric ID
    const isNumeric = typeof idOrSlug === 'number' || (typeof idOrSlug === 'string' && /^\d+$/.test(idStr));
    if (isNumeric) {
      try {
        return await httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL}/${idOrSlug}`);
      } catch (error) {
        return await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.PRODUCT_DETAIL}/${idOrSlug}`);
      }
    }
    
    // Otherwise, treat as slug
    const slug = idStr;
    // Query by slug to PHP backend
    return await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.PRODUCT_DETAIL}?product_id=${encodeURIComponent(slug)}`);
  }

  static async getProductBySlug(slug: string): Promise<any> {
    return this.getProduct(slug);
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
  }): Promise<any> {
    console.log('[ApiService] createOrder called with data:', JSON.stringify(orderData, null, 2));
    
    try {
      // Try Gateway (port 80) first
      console.log('[ApiService] Trying Gateway (port 80):', API_CONFIG.ENDPOINTS.ORDERS);
      const response = await httpClient.post(API_CONFIG.ENDPOINTS.ORDERS, orderData);
      console.log('[ApiService] Gateway response:', response);
      return response;
    } catch (error: any) {
      console.error('[ApiService] Gateway failed:', error.message);
      
      // If Gateway (port 80) fails, try direct Node.js backend (port 3001)
      const isNetworkError = error instanceof ApiError && error.status === 0;
      if (isNetworkError && API_CONFIG.BASE_URL === 'http://localhost') {
        try {
          console.warn('[ApiService] Gateway (port 80) không khả dụng, thử Node.js backend trực tiếp (port 3001)...');
          const directBackendClient = new HttpClient('http://localhost:3001');
          const response = await directBackendClient.post('/api/node/orders', orderData);
          console.log('[ApiService] Direct Node.js backend response:', response);
          return response;
        } catch (directError: any) {
          console.error('[ApiService] Direct Node.js backend failed:', directError.message);
          // Fall through to PHP fallback
        }
      }
      
      // Fallback to PHP backend
      try {
        console.log('[ApiService] Falling back to PHP backend:', API_CONFIG.ENDPOINTS.PHP.ORDERS);
        const phpResponse = await httpClient.post(API_CONFIG.ENDPOINTS.PHP.ORDERS, orderData);
        console.log('[ApiService] PHP backend response:', phpResponse);
        return phpResponse;
      } catch (phpError: any) {
        console.error('[ApiService] PHP backend also failed:', phpError.message);
        throw phpError;
      }
    }
  }

  static async getOrderHistory(): Promise<any[]> {
    // Helper function to parse and transform orders
    const parseOrders = (response: any): any[] => {
      let orders: any[] = [];
      
      // Handle API response format: { success: true, data: { orders: [...], pagination: {...} } }
      if (response && typeof response === 'object') {
        // Check if response has data property
        if ('data' in response && response.data) {
          // Check if data has orders array
          if (typeof response.data === 'object' && 'orders' in response.data && Array.isArray(response.data.orders)) {
            orders = response.data.orders;
          }
          // Check if data itself is an array
          else if (Array.isArray(response.data)) {
            orders = response.data;
          }
        }
        // Check if response is directly an array
        else if (Array.isArray(response)) {
          orders = response;
        }
      }
      
      // Transform backend order format to frontend format
      return orders.map((order: any) => {
        // Prefer structured items if present
        let itemsArr: any[] = [];
        if (order.products_items) {
          try {
            const raw = typeof order.products_items === 'string' ? JSON.parse(order.products_items) : order.products_items;
            if (Array.isArray(raw)) {
              itemsArr = raw.map((it: any, idx: number) => ({
                id: idx + 1,
                name: it.name,
                quantity: it.qty || it.quantity,
                price: it.price ?? 0,
                image: it.products_id ? getAdminMediaUrl(it.products_id) : '/images/placeholder.jpg',
                color: it.color || 'Default',
                size: it.size || 'Default'
              }));
            }
          } catch {}
        } else if (order.products_name) {
          // Backward compatibility: parse string
          itemsArr = order.products_name.split(',').map((item: string, index: number) => {
            const match = item.trim().match(/^(.+?)\s+x(\d+)$/);
            if (match) {
              return { id: index + 1, name: match[1], quantity: parseInt(match[2]), price: 0, image: '/images/placeholder.jpg', color: 'Default', size: 'Default' };
            }
            return { id: index + 1, name: item.trim(), quantity: 1, price: 0, image: '/images/placeholder.jpg', color: 'Default', size: 'Default' };
          });
        }

        return {
          id: order.id,
          orderNumber: order.order_id || `ORD${String(order.id).padStart(5, '0')}`,
          status: order.status || 'pending',
          placedAt: order.create_date || order.created_at,
          total: order.total_price ?? order.products_price ?? 0,
          shippingFee: 0,
          subtotal: order.products_price ?? 0,
          paymentMethod: order.payment_method || 'cod',
          notes: order.notes,
          items: itemsArr
        };
      });
    };

    try {
      // Try Gateway (port 80) first
      const response = await httpClient.get<ApiResponse<any>>(API_CONFIG.ENDPOINTS.ORDER_HISTORY);
      console.log('[ApiService] getOrderHistory - Raw response:', response);
      return parseOrders(response);
    } catch (error) {
      // If Gateway (port 80) fails, try direct Node.js backend (port 3001)
      const isNetworkError = error instanceof ApiError && error.status === 0;
      if (isNetworkError && API_CONFIG.BASE_URL === 'http://localhost') {
        try {
          console.warn('[ApiService] Gateway (port 80) không khả dụng, thử Node.js backend trực tiếp (port 3001)...');
          const directBackendClient = new HttpClient('http://localhost:3001');
          const response = await directBackendClient.get<ApiResponse<any>>('/api/node/orders/history');
          console.log('[ApiService] getOrderHistory - Direct backend response:', response);
          return parseOrders(response);
        } catch (directError) {
          console.warn('[ApiService] Direct Node.js backend cũng thất bại, thử PHP backend...');
          // Fall through to PHP fallback
        }
      }
      
      // Fallback to PHP backend
      try {
        const response = await httpClient.get<ApiResponse<any>>(API_CONFIG.ENDPOINTS.PHP.ORDER_HISTORY);
        console.log('[ApiService] getOrderHistory - PHP backend response:', response);
        return parseOrders(response);
      } catch (phpError) {
        console.error('[ApiService] getOrderHistory - Tất cả backends đều thất bại:', phpError);
        return [];
      }
    }
  }

  static async getOrder(id: number): Promise<any> {
    try {
      // Try Gateway (port 80) first
      return await httpClient.get(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
    } catch (error) {
      // If Gateway (port 80) fails, try direct Node.js backend (port 3001)
      const isNetworkError = error instanceof ApiError && error.status === 0;
      if (isNetworkError && API_CONFIG.BASE_URL === 'http://localhost') {
        try {
          console.warn('[ApiService] Gateway (port 80) không khả dụng, thử Node.js backend trực tiếp (port 3001)...');
          const directBackendClient = new HttpClient('http://localhost:3001');
          return await directBackendClient.get(`/api/node/orders/${id}`);
        } catch (directError) {
          // Fall through to PHP fallback
        }
      }
      
      // Fallback to PHP backend
      try {
        return await httpClient.get(`${API_CONFIG.ENDPOINTS.PHP.ORDERS}/${id}`);
      } catch (phpError) {
        throw error; // Throw original error if all fail
      }
    }
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
