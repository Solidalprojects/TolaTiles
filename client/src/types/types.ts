// client/src/types/types.ts - Extended with new types and fields for ProductType
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

// Updated ProductType interface with logo fields
export interface ProductType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | File;
  image_url?: string;
  icon_name?: string;  // New field for Lucide icon name
  display_order: number;
  active: boolean;
  show_in_navbar?: boolean;
  created_at: string;
  updated_at: string;
  tiles_count: number;
  tiles?: Tile[];
  categories_count?: number;
  categories?: Category[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_url?: string;
  product_type?: number; // Reference to the product type
  product_type_name?: string; // Name of the product type
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  images_count: number;
  images?: Tile[];
}

export interface TileImage {
  id: number;
  image: string;
  image_url?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  caption?: string;
  is_primary: boolean;
  created_at: string;
}

// Updated Tile interface with product_type
export interface Tile {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: number;
  category_name?: string;
  product_type?: number; // Reference to product type
  product_type_name?: string; // Name of the product type
  featured: boolean;
  price?: number;
  size?: string;
  material?: string;
  in_stock: boolean;
  sku: string;
  created_at: string;
  updated_at: string;
  primary_image?: string;
  images_count: number;
  images?: TileImage[];
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

// Updated Project interface with product_type
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
  product_type?: number; // Reference to product type
  product_type_name?: string; // Name of the product type
  area_size?: string;
  testimonial?: string;
  created_at: string;
  updated_at: string;
  primary_image?: string;
  images_count: number;
  images?: ProjectImage[];
  tiles_used?: Tile[];
  testimonials?: CustomerTestimonial[];
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  image_url?: string;
  email?: string;
  phone?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerTestimonial {
  image_url: any;
  id: number;
  customer_name: string;
  location?: string;
  testimonial: string;
  project?: number;
  project_title?: string;
  rating: number;
  date: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
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
  PRODUCT_TYPES = 'product_types',
  TEAM = 'team',
  TESTIMONIALS = 'testimonials'
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

// Enhanced FilterOptions with new fields
export interface FilterOptions {
  featured?: boolean;
  category?: number | string;
  product_type?: number | string;
  in_stock?: boolean;
  material?: string;
  search?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
  
  // Add additional filtering options that might be common across services
  active?: boolean;
  approved?: boolean;
  rating?: number;
  project?: number;
  min_rating?: number;
  max_rating?: number;
  show_in_navbar?: boolean; // Added for product types filtering
}