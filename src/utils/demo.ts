// Demo utilities for testing API integration
// Sử dụng để test các tính năng API

import { ApiService } from '../services/api';

export const demoCredentials = {
  email: 'demo@timelite.com',
  password: 'Timelite2025!'
};

export const testCredentials = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Demo function để test API
export const testApiIntegration = async () => {
  console.log('🧪 Testing API Integration...');
  
  try {
    // Test 1: Register new user
    console.log('1. Testing user registration...');
    try {
      const registerResponse = await ApiService.register(testCredentials);
      console.log('✅ Registration successful:', registerResponse);
    } catch (error) {
      console.log('ℹ️ Registration failed (user might exist):', error);
    }

    // Test 2: Login
    console.log('2. Testing user login...');
    const loginResponse = await ApiService.login(testCredentials);
    console.log('✅ Login successful:', loginResponse);

    // Test 3: Get profile
    console.log('3. Testing get profile...');
    const profile = await ApiService.getProfile();
    console.log('✅ Profile retrieved:', profile);

    // Test 4: Get products
    console.log('4. Testing get products...');
    const products = await ApiService.getProducts({ page: 1, limit: 5 });
    console.log('✅ Products retrieved:', products);

    // Test 5: Get order history
    console.log('5. Testing get order history...');
    const orders = await ApiService.getOrderHistory();
    console.log('✅ Order history retrieved:', orders);

    console.log('🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

// Demo function để test authentication flow
export const testAuthFlow = async () => {
  console.log('🔐 Testing Authentication Flow...');
  
  try {
    // Test login with demo credentials
    console.log('Testing login with demo credentials...');
    const response = await ApiService.login(demoCredentials);
    console.log('✅ Demo login successful:', response);
    
    // Test profile access
    console.log('Testing profile access...');
    const profile = await ApiService.getProfile();
    console.log('✅ Profile access successful:', profile);
    
    console.log('🎉 Authentication flow test completed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
};

// Helper function để clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('timelite:auth-status');
  localStorage.removeItem('timelite:jwt-token');
  localStorage.removeItem('timelite:user-data');
  console.log('🧹 Auth data cleared');
};

// Helper function để check auth status
export const checkAuthStatus = () => {
  const authStatus = localStorage.getItem('timelite:auth-status');
  const jwtToken = localStorage.getItem('timelite:jwt-token');
  const userData = localStorage.getItem('timelite:user-data');
  
  console.log('📊 Auth Status Check:');
  console.log('- Auth Status:', authStatus);
  console.log('- JWT Token:', jwtToken ? 'Present' : 'Missing');
  console.log('- User Data:', userData ? JSON.parse(userData) : 'Missing');
  
  return {
    isAuthenticated: authStatus === 'true',
    hasToken: !!jwtToken,
    userData: userData ? JSON.parse(userData) : null
  };
};

// Export demo functions to window for console testing
if (typeof window !== 'undefined') {
  (window as any).demo = {
    testApiIntegration,
    testAuthFlow,
    clearAuthData,
    checkAuthStatus,
    credentials: {
      demo: demoCredentials,
      test: testCredentials
    }
  };
  
  console.log('🎮 Demo functions available in window.demo:');
  console.log('- demo.testApiIntegration() - Test all API endpoints');
  console.log('- demo.testAuthFlow() - Test authentication flow');
  console.log('- demo.clearAuthData() - Clear all auth data');
  console.log('- demo.checkAuthStatus() - Check current auth status');
  console.log('- demo.credentials - Available test credentials');
}
