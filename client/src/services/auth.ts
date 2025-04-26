// client/src/services/auth.ts
import axios from 'axios';
import { LoginCredentials, AuthResponse, User } from '../types/types';

const API_URL = 'http://localhost:8000/api/';

/**
 * Login user and store authentication data in localStorage
 * @param credentials User login credentials
 * @returns Authentication response with tokens and user data
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}auth/login/`, credentials);
    if (response.data.access) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error;
    } else {
      throw new Error('Network error occurred during login');
    }
  }
};

/**
 * Remove user data from localStorage
 */
export const logout = (): void => {
  localStorage.removeItem('user');
};

/**
 * Get current user data from localStorage
 * @returns User authentication data or null if not logged in
 */
export const getCurrentUser = (): AuthResponse | null => {
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

/**
 * Check if current auth token is expired
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (): boolean => {
  const user = getCurrentUser();
  if (!user) return true;
  
  try {
    // JWT tokens are in three parts separated by dots
    const payload = user.access.split('.')[1];
    // Decode the base64 string
    const decoded = JSON.parse(atob(payload));
    // Check if token is expired
    const exp = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

/**
 * Generate authorization header with JWT token
 * @returns Authorization header object
 */
export const authHeader = (): Record<string, string> => {
  const user = getCurrentUser();
  if (user && user.access) {
    // Check if token is expired
    if (isTokenExpired()) {
      // Token is expired, handle refresh or logout
      logout();
      window.location.href = '/auth/login';
      return {};
    }
    return { Authorization: `Bearer ${user.access}` };
  }
  return {};
};

/**
 * Refresh the access token using the refresh token
 * @returns Promise with new auth data
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const user = getCurrentUser();
  if (!user || !user.refresh) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post(`${API_URL}auth/refresh/`, {
      refresh: user.refresh
    });
    
    // Update localStorage with new tokens
    localStorage.setItem('user', JSON.stringify({
      ...user,
      access: response.data.access,
      refresh: response.data.refresh
    }));
    
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};

// Setup an axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await refreshToken();
        // Update the header with the new token
        const user = getCurrentUser();
        if (user && user.access) {
          originalRequest.headers['Authorization'] = `Bearer ${user.access}`;
        }
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);