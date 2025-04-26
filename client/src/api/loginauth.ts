// Fix 1: Update client/src/api/loginauth.ts
// This file handles the login request and token storage

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
    // Explicitly set content type and don't send credentials yet
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      // Create a detailed error message
      const errorData = await response.json();
      throw new Error(errorData.error || 'Authentication failed');
    }
    
    const data = await response.json();
    
    // Check if response contains token and user data
    if (data.token && data.user) {
      // Store token in localStorage
      setStoredAuth(data.token);
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Set a session flag for additional security
      sessionStorage.setItem('sessionAuth', 'true');
      
      console.log('Authentication successful');
      return data;
    } else {
      console.error('Authentication failed: Invalid response format', data);
      throw new Error('Authentication failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

