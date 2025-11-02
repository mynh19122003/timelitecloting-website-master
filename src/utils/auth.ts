import { ApiService } from '../services/api';

const AUTH_STORAGE_KEY = "timelite:auth-status";
const JWT_STORAGE_KEY = "timelite:jwt-token";
const USER_STORAGE_KEY = "timelite:user-data";
const AUTH_EVENT_NAME = "timelite-auth-changed";

// User data interface
export interface UserData {
  id: number;
  user_code: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export const getAuthStatus = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true" && 
         !!window.localStorage.getItem(JWT_STORAGE_KEY);
};

export const getJWTToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(JWT_STORAGE_KEY);
};

export const getUserData = (): UserData | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const userData = window.localStorage.getItem(USER_STORAGE_KEY);
  return userData ? JSON.parse(userData) : null;
};

const broadcastAuthChange = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
};

export const setAuthStatus = (isAuthenticated: boolean, userData?: UserData, token?: string) => {
  if (typeof window === "undefined") {
    return;
  }
  
  if (isAuthenticated && token && userData) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
    window.localStorage.setItem(JWT_STORAGE_KEY, token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(JWT_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
  broadcastAuthChange();
};

export const clearAuthStatus = () => {
  setAuthStatus(false);
  ApiService.logout();
};

// Check if JWT token is expired
export const isTokenExpired = (): boolean => {
  const token = getJWTToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Validate current authentication
export const validateAuth = async (): Promise<boolean> => {
  if (!getAuthStatus() || isTokenExpired()) {
    clearAuthStatus();
    return false;
  }

  try {
    // Verify token with backend
    const userData = await ApiService.getProfile();
    setAuthStatus(true, userData, getJWTToken()!);
    return true;
  } catch (error) {
    clearAuthStatus();
    return false;
  }
};

export const subscribeToAuthChanges = (
  listener: (isAuthenticated: boolean) => void,
) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleCustomEvent: EventListener = () => {
    listener(getAuthStatus());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === AUTH_STORAGE_KEY) {
      listener(getAuthStatus());
    }
  };

  window.addEventListener(AUTH_EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorage);
  };
};

export const AUTH_EVENTS = {
  name: AUTH_EVENT_NAME,
  storageKey: AUTH_STORAGE_KEY,
} as const;
