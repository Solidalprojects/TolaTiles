// src/types/auth.ts
export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff?: boolean;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}