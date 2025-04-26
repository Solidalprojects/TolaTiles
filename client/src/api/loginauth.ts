// client/src/api/loginauth.ts
import { apiClient } from './header';
import { API_ENDPOINTS } from './api';
import { User } from '../types/types';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(credentials: LoginFormData): Promise<AuthResponse> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store user data for later use
    if (response.user) {
      localStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}