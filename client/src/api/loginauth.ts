// client/src/api/loginauth.ts
import { apiClient } from './header';
import { API_ENDPOINTS } from './api';
import { User } from '../types/types';
import { setStoredAuth } from './storedAuth';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(credentials: LoginFormData): Promise<AuthResponse> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Check if response contains token and user data
    if (response.token && response.user) {
      // Store token in localStorage
      setStoredAuth(response.token);
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // Set a session flag for additional security
      sessionStorage.setItem('sessionAuth', 'true');
      
      console.log('Authentication successful');
      return response;
    } else {
      console.error('Authentication failed: Invalid response format', response);
      throw new Error('Authentication failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}