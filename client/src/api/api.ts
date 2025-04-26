
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
  TILES: {
    BASE: `${API_BASE_URL}/api/tiles/`,
    DETAIL: (idOrSlug: number | string) => `${API_BASE_URL}/api/tiles/${idOrSlug}/`,
    FEATURED: `${API_BASE_URL}/api/tiles/?featured=true`,
    BY_CATEGORY: (categoryIdOrSlug: number | string) => 
      `${API_BASE_URL}/api/tiles/?category=${categoryIdOrSlug}`,
  },
  PROJECTS: {
    BASE: `${API_BASE_URL}/api/projects/`,
    DETAIL: (idOrSlug: number | string) => `${API_BASE_URL}/api/projects/${idOrSlug}/`,
    FEATURED: `${API_BASE_URL}/api/projects/?featured=true`,
    IMAGES: `${API_BASE_URL}/api/project-images/`,
  },
  CONTACT: {
    SUBMIT: `${API_BASE_URL}/api/contacts/`,
  },
  NEWSLETTER: {
    SUBSCRIBE: `${API_BASE_URL}/api/newsletter/subscribe/`,
    UNSUBSCRIBE: `${API_BASE_URL}/api/newsletter/unsubscribe/`,
  },
};