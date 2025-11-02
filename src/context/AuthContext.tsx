"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuthStatus, 
  getUserData, 
  setAuthStatus, 
  clearAuthStatus, 
  validateAuth,
  subscribeToAuthChanges,
  UserData 
} from '../utils/auth';
import { ApiService, ApiError } from '../services/api';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const authStatus = getAuthStatus();
        if (authStatus) {
          // Validate token with backend
          const isValid = await validateAuth();
          if (isValid) {
            const userData = getUserData();
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges((authStatus) => {
      setIsAuthenticated(authStatus);
      if (authStatus) {
        setUser(getUserData());
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.login({ email, password });
      
      // Update auth state
      setAuthStatus(true, response.user, response.token);
      setIsAuthenticated(true);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            setError('Email hoặc mật khẩu không đúng');
            break;
          case 400:
            setError('Thông tin đăng nhập không hợp lệ');
            break;
          case 500:
            setError('Lỗi server. Vui lòng thử lại sau');
            break;
          default:
            setError(error.message || 'Đăng nhập thất bại');
        }
      } else {
        setError('Lỗi kết nối. Vui lòng kiểm tra mạng');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.register({ 
        email, 
        password,
        name 
      });
      
      // Update auth state
      setAuthStatus(true, response.user, response.token);
      setIsAuthenticated(true);
      setUser(response.user);
    } catch (error) {
      console.error('Register error:', error);
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 409:
            setError('Email này đã được sử dụng');
            break;
          case 400:
            setError('Thông tin đăng ký không hợp lệ');
            break;
          case 500:
            setError('Lỗi server. Vui lòng thử lại sau');
            break;
          default:
            setError(error.message || 'Đăng ký thất bại');
        }
      } else {
        setError('Lỗi kết nối. Vui lòng kiểm tra mạng');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearAuthStatus();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await ApiService.changePassword({
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            setError('Mật khẩu hiện tại không đúng');
            break;
          case 400:
            setError('Mật khẩu mới không hợp lệ');
            break;
          case 500:
            setError('Lỗi server. Vui lòng thử lại sau');
            break;
          default:
            setError(error.message || 'Đổi mật khẩu thất bại');
        }
      } else {
        setError('Lỗi kết nối. Vui lòng kiểm tra mạng');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      const userData = await ApiService.getProfile();
      setUser(userData);
      
      // Update stored user data
      const token = ApiService.getToken();
      if (token) {
        setAuthStatus(true, userData, token);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Don't logout on refresh failure - just log the error
      // This prevents logout when updating profile fails
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    changePassword,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
