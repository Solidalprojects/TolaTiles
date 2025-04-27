// services/productTypeService.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { getStoredAuth } from './auth';
import { ProductType, FilterOptions } from '../types/types';
import API_BASE_URL from '../utils/apiConstants';

// Helper function to get clean auth token
const getAuthToken = (): string | null => {
  const { token } = getStoredAuth();
  return token && token.trim() !== '' ? token.trim() : null;
};

// Define API endpoints if not already present in API_ENDPOINTS
const PRODUCT_TYPES_BASE = `${API_BASE_URL}/api/product-types/`;
const getProductTypeDetailUrl = (idOrSlug: number | string) => `${PRODUCT_TYPES_BASE}${idOrSlug}/`;

export const productTypeService = {
  getProductTypes: async (filters?: Partial<FilterOptions>): Promise<ProductType[]> => {
    try {
      let url = API_ENDPOINTS.PRODUCT_TYPES?.BASE || PRODUCT_TYPES_BASE;
      
      // Apply filters if provided
      if (filters) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      console.log('Fetching product types from URL:', url);
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      
      console.log('Product types fetched:', response);
      return response;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  },

  getProductTypeById: async (id: number): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      const detailUrl = API_ENDPOINTS.PRODUCT_TYPES?.DETAIL?.(id) || getProductTypeDetailUrl(id);
      
      const response = await apiClient.get(detailUrl, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching product type with id ${id}:`, error);
      throw error;
    }
  },

  getProductTypeBySlug: async (slug: string): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      const detailUrl = API_ENDPOINTS.PRODUCT_TYPES?.DETAIL?.(slug) || getProductTypeDetailUrl(slug);
      
      const response = await apiClient.get(detailUrl, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching product type with slug ${slug}:`, error);
      throw error;
    }
  },

  createProductType: async (data: Partial<ProductType>): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      const url = API_ENDPOINTS.PRODUCT_TYPES?.BASE || PRODUCT_TYPES_BASE;
      
      const response = await apiClient.post(url, data, token || undefined);
      return response;
    } catch (error) {
      console.error('Error creating product type:', error);
      throw error;
    }
  },

  updateProductType: async (id: number, data: Partial<ProductType>): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      const detailUrl = API_ENDPOINTS.PRODUCT_TYPES?.DETAIL?.(id) || getProductTypeDetailUrl(id);
      
      const response = await apiClient.patch(detailUrl, data, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error updating product type with id ${id}:`, error);
      throw error;
    }
  },

  deleteProductType: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      const detailUrl = API_ENDPOINTS.PRODUCT_TYPES?.DETAIL?.(id) || getProductTypeDetailUrl(id);
      
      await apiClient.delete(detailUrl, token || undefined);
    } catch (error) {
      console.error(`Error deleting product type with id ${id}:`, error);
      throw error;
    }
  }
};

export default productTypeService;