// client/src/services/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}


export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}auth/login/`, credentials);
  if (response.data.access) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): AuthResponse | null => {
  const user = localStorage.getItem('user');
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

export const authHeader = (): Record<string, string> => {
  const user = getCurrentUser();
  if (user && user.access) {
    return { Authorization: `Bearer ${user.access}` };
  }
  return {};
};

// client/src/components/Login.tsx