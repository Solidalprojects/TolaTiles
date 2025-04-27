// client/src/api/api.ts - Enhanced API endpoints for product types, team, and testimonials

// Base API URL configuration
export const API_BASE_URL = 'http://localhost:8000';

// API endpoint paths
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login/`,
    REGISTER: `${API_BASE_URL}/api/auth/register/`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh/`,
    VERIFY: `${API_BASE_URL}/api/auth/verify/`,
    USER_INFO: `${API_BASE_URL}/api/auth/user/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password/`,
  },
  CATEGORIES: {
    BASE: `${API_BASE_URL}/api/categories/`,
    DETAIL: (idOrSlug: number | string) => `${API_BASE_URL}/api/categories/${idOrSlug}/`,
  },
  PRODUCT_TYPES: {
    BASE: `${API_BASE_URL}/api/product-types/`,
    DETAIL: (idOrSlug: number | string) => `${API_BASE_URL}/api/product-types/${idOrSlug}/`,
    FEATURED: `${API_BASE_URL}/api/product-types/?featured=true`,
  },
  TILES: {
    BASE: `${API_BASE_URL}/api/tiles/`,
    DETAIL: (idOrSlug: number | string) => `${API_BASE_URL}/api/tiles/${idOrSlug}/`,
    FEATURED: `${API_BASE_URL}/api/tiles/?featured=true`,
    BY_CATEGORY: (categoryIdOrSlug: number | string) => 
      `${API_BASE_URL}/api/tiles/?category=${categoryIdOrSlug}`,
    BY_PRODUCT_TYPE: (productTypeIdOrSlug: number | string) => 
      `${API_BASE_URL}/api/tiles/?product_type=${productTypeIdOrSlug}`,
    IMAGES: `${API_BASE_URL}/api/tile-images/`,
    IMAGE_DETAIL: (id: number) => `${API_BASE_URL}/api/tile-images/${id}/`,
    SET_PRIMARY: (id: number) => `${API_BASE_URL}/api/tile-images/${id}/set_as_primary/`,
    SEARCH: (query: string) => `${API_BASE_URL}/api/tiles/?search=${query}`,
    FILTER: {
      MATERIAL: (material: string) => `${API_BASE_URL}/api/tiles/?material=${material}`,
      PRICE_RANGE: (min: number, max: number) => 
        `${API_BASE_URL}/api/tiles/?min_price=${min}&max_price=${max}`,
      IN_STOCK: (inStock: boolean) => `${API_BASE_URL}/api/tiles/?in_stock=${inStock}`,
    },
  },
  PROJECTS: {
    BASE: `${API_BASE_URL}/api/projects/`,
    DETAIL: (idOrSlug: number | string) => `${API_BASE_URL}/api/projects/${idOrSlug}/`,
    FEATURED: `${API_BASE_URL}/api/projects/?featured=true`,
    BY_PRODUCT_TYPE: (productTypeIdOrSlug: number | string) => 
      `${API_BASE_URL}/api/projects/?product_type=${productTypeIdOrSlug}`,
    IMAGES: `${API_BASE_URL}/api/project-images/`,
    IMAGE_DETAIL: (id: number) => `${API_BASE_URL}/api/project-images/${id}/`,
  },
  TEAM: {
    BASE: `${API_BASE_URL}/api/team/`,
    DETAIL: (id: number) => `${API_BASE_URL}/api/team/${id}/`,
  },
  TESTIMONIALS: {
    BASE: `${API_BASE_URL}/api/testimonials/`,
    DETAIL: (id: number) => `${API_BASE_URL}/api/testimonials/${id}/`,
    BY_PROJECT: (projectId: number) => `${API_BASE_URL}/api/testimonials/?project=${projectId}`,
    BY_RATING: (rating: number) => `${API_BASE_URL}/api/testimonials/?rating=${rating}`,
    SUBMIT: `${API_BASE_URL}/api/testimonials/`,
  },
  CONTACT: {
    SUBMIT: `${API_BASE_URL}/api/contacts/`,
  },
  NEWSLETTER: {
    SUBSCRIBE: `${API_BASE_URL}/api/newsletter/subscribe/`,
    UNSUBSCRIBE: `${API_BASE_URL}/api/newsletter/unsubscribe/`,
  },
};