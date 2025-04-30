// client/src/services/productTypeService.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { getStoredAuth } from './auth';
import { ProductType, FilterOptions } from '../types/types';
import axios from 'axios';

// Helper function to get clean auth token
const getAuthToken = (): string | null => {
  const { token } = getStoredAuth();
  return token && token.trim() !== '' ? token.trim() : null;
};

export const productTypeService = {
  getProductTypes: async (filters?: Partial<FilterOptions>): Promise<ProductType[]> => {
    try {
      let url = API_ENDPOINTS.PRODUCT_TYPES.BASE;
      
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
      
      console.log('Product types fetched:', response.length || 0);
      return response;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  },

  getProductTypeById: async (id: number): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_TYPES.DETAIL(id), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching product type with id ${id}:`, error);
      throw error;
    }
  },

  getProductTypeBySlug: async (slug: string): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_TYPES.DETAIL(slug), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching product type with slug ${slug}:`, error);
      throw error;
    }
  },

  createProductType: async (data: Partial<ProductType>): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to create product types');
      }
      
      // Use FormData if we have an image, otherwise use JSON
      if (data.image instanceof File) {
        const formData = new FormData();
        
        // Add all other fields to formData
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'image' && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        
        // Add the image
        formData.append('image', data.image);
        
        // Use axios directly for FormData
        const response = await axios.post(
          API_ENDPOINTS.PRODUCT_TYPES.BASE,
          formData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              // Don't set Content-Type, let axios set it with the boundary
            }
          }
        );
        
        return response.data;
      } else {
        // Use regular JSON approach
        const response = await apiClient.post(API_ENDPOINTS.PRODUCT_TYPES.BASE, data, token);
        return response;
      }
    } catch (error) {
      console.error('Error creating product type:', error);
      throw error;
    }
  },

  updateProductType: async (id: number, data: Partial<ProductType>): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to update product types');
      }
      
      // Use FormData if we have an image, otherwise use JSON
      if (data.image instanceof File) {
        const formData = new FormData();
        
        // Add all other fields to formData
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'image' && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        
        // Add the image
        formData.append('image', data.image);
        
        // Use axios directly for FormData
        const response = await axios.patch(
          API_ENDPOINTS.PRODUCT_TYPES.DETAIL(id),
          formData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              // Don't set Content-Type, let axios set it with the boundary
            }
          }
        );
        
        return response.data;
      } else {
        // Use regular JSON approach
        const response = await apiClient.patch(API_ENDPOINTS.PRODUCT_TYPES.DETAIL(id), data, token);
        return response;
      }
    } catch (error) {
      console.error(`Error updating product type with id ${id}:`, error);
      throw error;
    }
  },

  deleteProductType: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to delete product types');
      }
      
      await apiClient.delete(API_ENDPOINTS.PRODUCT_TYPES.DETAIL(id), token);
      console.log(`Product type ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting product type with id ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get a list of all active product types
   */
  getActiveProductTypes: async (): Promise<ProductType[]> => {
    return productTypeService.getProductTypes({ active: true });
  },
  
  /**
   * Get product types with their associated tiles
   */
  getProductTypesWithTiles: async (): Promise<ProductType[]> => {
    try {
      const token = getAuthToken();
      const url = `${API_ENDPOINTS.PRODUCT_TYPES.BASE}?include_tiles=true`;
      const response = await apiClient.get(url, token || undefined);
      return response;
    } catch (error) {
      console.error('Error fetching product types with tiles:', error);
      throw error;
    }
  }
};

export default productTypeService;