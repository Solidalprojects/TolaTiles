// client/src/services/auth.ts
import axios from 'axios';
import { LoginCredentials, AuthResponse, User, RegisterCredentials } from '../types/types';

const API_URL = 'http://localhost:8000/api/';

/**
 * Login user and store authentication data in localStorage
 * @param credentials User login credentials
 * @returns Authentication response with tokens and user data
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Make sure we're sending the proper format with trailing slash
    const loginUrl = `${API_URL}auth/login/`;
    console.log('Login attempt with:', credentials.username);
    console.log('Login URL:', loginUrl);
    
    const response = await axios.post(loginUrl, {
      username: credentials.username,
      password: credentials.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Login response status:', response.status);
    
    // Check if we have access token in the response
    if (response.data && response.data.access) {
      console.log('Login successful, storing user data');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      console.error('Invalid response format:', response.data);
      throw new Error('Authentication failed: Invalid response format');
    }
  } catch (error: any) {
    console.error('Login error details:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server response error status:', error.response.status);
      console.error('Server response error data:', error.response.data);
      throw error;
    } else {
      console.error('Non-Axios error or network error:', error.message);
      throw new Error('Network error occurred during login');
    }
  }
};

/**
 * Register a new user and return authentication data
 * @param credentials User registration details
 * @returns Authentication response with tokens and user data
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}auth/register/`, credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.access) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Registration failed: Invalid response format');
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw error;
    } else {
      throw new Error('Network error occurred during registration');
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
  if (!user || !user.access) return true;
  
  try {
    // JWT tokens are in three parts separated by dots
    const payload = user.access.split('.')[1];
    // Decode the base64 string
    const decoded = JSON.parse(atob(payload));
    // Check if token is expired
    const exp = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
};

/**
 * Check if user is authenticated
 * @returns boolean indicating if user is authenticated with valid token
 */
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return !!user && !isTokenExpired();
};

/**
 * Check if current user is an admin
 * @returns boolean indicating if user is an admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return !!user && !!user.user && user.user.is_staff === true;
};

/**
 * Generate authorization header with JWT token
 * @returns Authorization header object
 */
export const authHeader = (): Record<string, string> => {
  const user = getCurrentUser();
  if (user && user.access) {
    return { Authorization: `Bearer ${user.access}` };
  }
  return {};
};

/**
 * Change password for the authenticated user
 * @param oldPassword Current password
 * @param newPassword New password to set
 * @returns Response data with new tokens
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_URL}auth/change-password/`,
      { old_password: oldPassword, new_password: newPassword },
      { headers: authHeader() }
    );
    
    if (response.data && response.data.access) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
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
    const updatedUser = {
      ...user,
      access: response.data.access,
      refresh: response.data.refresh || user.refresh
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Token refresh error:', error);
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
        const refreshedUser = await refreshToken();
        // Update the header with the new token
        if (refreshedUser && refreshedUser.access) {
          originalRequest.headers['Authorization'] = `Bearer ${refreshedUser.access}`;
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