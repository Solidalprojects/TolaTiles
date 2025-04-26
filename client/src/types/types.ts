// client/src/types/types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
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

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface PasswordChangeCredentials {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_url?: string;
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  images_count: number;
  images?: Tile[];
}

export interface Tile {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  image_url?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  category: number;
  category_name?: string;
  featured: boolean;
  price?: number;
  size?: string;
  material?: string;
  in_stock: boolean;
  sku: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: number;
  image: string;
  image_url?: string;
  caption?: string;
  is_primary: boolean;
  project?: number;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  client: string;
  location: string;
  completed_date: string;
  status: string;
  status_display: string;
  featured: boolean;
  area_size?: string;
  testimonial?: string;
  created_at: string;
  updated_at: string;
  primary_image?: string;
  images_count: number;
  images?: ProjectImage[];
  tiles_used?: Tile[];
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SubscribeForm {
  email: string;
  name?: string;
}

export enum ActiveTab {
  TILES = 'tiles',
  CATEGORIES = 'categories',
  PROJECTS = 'projects',
  CONTACTS = 'contacts',
  SUBSCRIBERS = 'subscribers',
  SETTINGS = 'settings',
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FilterOptions {
  featured?: boolean;
  category?: number | string;
  in_stock?: boolean;
  material?: string;
  search?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}