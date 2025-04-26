// client/src/services/auth.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { LoginFormData, AuthState } from '../api/loginauth';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../api/storedAuth';

// Clear any potentially invalid auth data on load
const checkAndClearInvalidAuth = () => {
  try {
    const { token } = getStoredAuth();
    if (token && (typeof token !== 'string' || token.trim() === '')) {
      console.warn('Invalid token found in storage, clearing auth data');
      clearStoredAuth();
    }
  } catch (error) {
    console.error('Error checking stored auth:', error);
    clearStoredAuth();
  }
};

// Run the check when this module is imported
checkAndClearInvalidAuth();

// Login function that calls the API and manages token storage
export const login = async (credentials: LoginFormData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.token && response.user) {
      console.log('Login successful, token received:', !!response.token);
      
      // Store token in localStorage
      setStoredAuth(response.token);
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      return response;
    } else {
      console.error('Authentication failed: Invalid response format', response);
      throw new Error('Authentication failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout function to clear stored credentials
export const logout = () => {
  console.log('Logging out, clearing auth data');
  clearStoredAuth();
  localStorage.removeItem('userData');
};

export const clearAllAuthData = () => {
  console.log('Clearing all authentication data');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('userData');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('userData');
  sessionStorage.removeItem('sessionAuth');
  
  // Clear cookies too
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};


// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  try {
    const { token } = getStoredAuth();
    const hasToken = !!token && typeof token === 'string' && token.trim() !== '';
    
    // Also check for session authentication flag
    const hasSessionToken = sessionStorage.getItem('sessionAuth') === 'true';
    
    return hasToken && hasSessionToken;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};



// Check if user is admin
export const isAdmin = (): boolean => {
  try {
    const userData = getCurrentUser();
    const isAdminUser = userData?.user?.is_staff || false;
    console.log('Checking admin status:', isAdminUser);
    return isAdminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get current user data
export const getCurrentUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    // Return stored user info
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      return null;
    }
    
    return {
      token: getStoredAuth().token,
      user: JSON.parse(userDataStr)
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Generate auth header for API requests
export const authHeader = (): Record<string, string> => {
  try {
    const { token } = getStoredAuth();
    
    if (token) {
      return { 'Authorization': `Token ${token}` };
    }
  } catch (error) {
    console.error('Error generating auth header:', error);
  }
  
  return {};
};