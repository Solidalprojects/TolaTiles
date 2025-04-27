// client/src/services/auth.ts
// Fixed version to properly handle token authentication

import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { LoginFormData } from '../types/auth';
import axios from 'axios';
// Add this import to fix the Tile type error
import { FilterOptions, Tile } from '../types/types';

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


export const tileService = {
  getTiles: async (filters?: Partial<FilterOptions>): Promise<Tile[]> => {
    try {
      let url = API_ENDPOINTS.TILES.BASE;
      
      // Apply filters if provided
      if (filters) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      const response = await apiClient.get(url, authHeader().Authorization);
      return response;
    } catch (error) {
      console.error('Error fetching tiles:', error);
      throw error;
    }
  },

  getTileById: async (id: number): Promise<Tile> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TILES.DETAIL(id), authHeader().Authorization);
      return response;
    } catch (error) {
      console.error(`Error fetching tile with id ${id}:`, error);
      throw error;
    }
  },

  createTile: async (formData: FormData): Promise<Tile> => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.TILES.BASE,
        formData,
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating tile:', error);
      throw error;
    }
  },

  updateTile: async (id: number, formData: FormData): Promise<Tile> => {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.TILES.DETAIL(id),
        formData,
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating tile with id ${id}:`, error);
      throw error;
    }
  },

  deleteTile: async (id: number): Promise<void> => {
    try {
      await axios.delete(
        API_ENDPOINTS.TILES.DETAIL(id),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting tile with id ${id}:`, error);
      throw error;
    }
  },
  
  // New method to manage tile images
  setImageAsPrimary: async (tileId: number, imageId: number): Promise<void> => {
    try {
      await axios.post(
        `${API_ENDPOINTS.TILES.BASE}images/${imageId}/set_as_primary/`,
        {},
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error setting image ${imageId} as primary for tile ${tileId}:`, error);
      throw error;
    }
  },
  
  // New method to delete a specific image
  deleteImage: async (imageId: number): Promise<void> => {
    try {
      await axios.delete(
        `${API_ENDPOINTS.TILES.BASE}images/${imageId}/`,
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting image ${imageId}:`, error);
      throw error;
    }
  }
};