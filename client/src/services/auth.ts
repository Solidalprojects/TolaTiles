// client/src/services/auth.ts
// Fixed version to properly handle token authentication

import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { LoginFormData } from '../types/auth';
// Remove unnecessary import for Tile to avoid circular dependencies
// import { FilterOptions, Tile } from '../types/types';

// Authentication storage keys
const TOKEN_KEY = 'adminToken';
const USER_DATA_KEY = 'userData';
const SESSION_AUTH_KEY = 'sessionAuth';

/**
 * Get authentication token from storage
 */
export const getStoredAuth = (): { token: string | null } => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return { token };
  } catch (error) {
    console.error('Error getting stored auth:', error);
    return { token: null };
  }
};

/**
 * Store authentication token
 */
export const setStoredAuth = (token: string) => {
  try {
    // Ensure the token is a clean string without extra spaces
    const cleanToken = token.trim();
    
    // Store in localStorage for persistence
    localStorage.setItem(TOKEN_KEY, cleanToken);
    
    // Also set the session flag
    sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    
    console.log('Auth token stored successfully');
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

/**
 * Clear authentication data
 */
export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    console.log('Auth token cleared');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

/**
 * Clear all authentication related data
 */
export const clearAllAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    
    console.log('All auth data cleared');
  } catch (error) {
    console.error('Error clearing all auth data:', error);
  }
};

/**
 * Login user and store authentication data
 */
export const login = async (credentials: LoginFormData) => {
  try {
    console.log('Attempting login with:', { username: credentials.username });
    
    // Call the login API endpoint
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response && response.token) {
      // Store the token
      setStoredAuth(response.token);
      
      // Store user data if available
      if (response.user) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      }
      
      return response;
    } else {
      throw new Error('Authentication failed: No token received');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user and clear auth data
 */
export const logout = () => {
  clearStoredAuth();
  localStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(SESSION_AUTH_KEY);
  
  console.log('User logged out successfully');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    const { token } = getStoredAuth();
    const hasToken = !!token && typeof token === 'string' && token.trim() !== '';
    
    // Also check for session authentication flag
    const hasSessionToken = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    
    return hasToken && hasSessionToken;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Check if authenticated user is an admin
 */
export const isAdmin = (): boolean => {
  try {
    const userData = getCurrentUser();
    return userData?.user?.is_staff || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get current authenticated user data
 */
export const getCurrentUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const userDataStr = localStorage.getItem(USER_DATA_KEY);
    if (!userDataStr) {
      return null;
    }
    
    return {
      token: getStoredAuth().token,
      user: JSON.parse(userDataStr)
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Generate auth header for API requests
 */
export const authHeader = (): Record<string, string> => {
  try {
    const { token } = getStoredAuth();
    
    if (token && token.trim() !== '') {
      return { 'Authorization': `Token ${token.trim()}` };
    }
    
    return {};
  } catch (error) {
    console.error('Error generating auth header:', error);
    return {};
  }
};