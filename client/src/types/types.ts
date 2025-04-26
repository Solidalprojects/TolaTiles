// client/src/types/types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  images?: Tile[];
}

export interface Tile {
  id: number;
  title: string;
  description: string;
  image: string;
  category: number;
  featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProjectImage {
  id: number;
  image: string;
  caption?: string;
  project?: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  client: string;
  location: string;
  completed_date: string;
  featured: boolean;
  created_at: string;
  images?: ProjectImage[];
}

export enum ActiveTab {
  TILES = 'tiles',
  CATEGORIES = 'categories',
  PROJECTS = 'projects',
}