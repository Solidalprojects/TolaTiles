// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/types';
import { getStoredAuth, setStoredAuth, clearStoredAuth, clearAllAuthData } from '../services/auth';
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token } = getStoredAuth();
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Verify token by fetching user info
        const userData = await apiClient.get(API_ENDPOINTS.AUTH.USER_INFO, token);
        
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          // Token invalid or expired
          clearAllAuthData();
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        clearAllAuthData();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call login API
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      
      if (response && response.token) {
        // Store token
        setStoredAuth(response.token);
        
        // Store session flag
        sessionStorage.setItem('sessionAuth', 'true');
        
        // Set user data
        setUser(response.user);
        setIsAuthenticated(true);
        
        console.log('User logged in successfully:', response.user.username);
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call register API
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REGISTER, 
        { 
          username, 
          email, 
          password,
          first_name: firstName || '',
          last_name: lastName || ''
        }
      );
      
      if (response && response.token) {
        // Store token
        setStoredAuth(response.token);
        
        // Store session flag
        sessionStorage.setItem('sessionAuth', 'true');
        
        // Set user data
        setUser(response.user);
        setIsAuthenticated(true);
        
        console.log('User registered and logged in successfully:', response.user.username);
      } else {
        throw new Error('Registration failed: No token received');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAllAuthData();
    setIsAuthenticated(false);
    setUser(null);
    console.log('User logged out');
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token } = getStoredAuth();
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Call update profile API
      const updatedUser = await apiClient.patch(
        API_ENDPOINTS.AUTH.USER_INFO,
        userData,
        token
      );
      
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
      console.log('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;