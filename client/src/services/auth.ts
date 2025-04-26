// client/src/services/auth.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { LoginFormData, AuthState } from '../api/loginauth';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../api/storedAuth';

// Login function that calls the API and manages token storage
export const login = async (credentials: LoginFormData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.token && response.user) {
      // Store token in localStorage
      setStoredAuth(response.token);
      return response;
    } else {
      throw new Error('Authentication failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout function to clear stored credentials
export const logout = () => {
  clearStoredAuth();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const { token } = getStoredAuth();
  return !!token;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const userData = getCurrentUser();
  return userData?.user?.is_staff || false;
};

// Get current user data from token
export const getCurrentUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    // Return stored user info
    return {
      token: getStoredAuth().token,
      user: JSON.parse(localStorage.getItem('userData') || '{}')
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Generate auth header for API requests
export const authHeader = (): Record<string, string> => {
  const { token } = getStoredAuth();
  
  if (token) {
    return { 'Authorization': `Token ${token}` };
  }
  
  return {};
};