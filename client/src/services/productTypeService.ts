// client/src/services/productTypeService.ts - Updated to handle logo field
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

  createProductType: async (formData: FormData | Partial<ProductType>): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to create product types');
      }
      
      // Check if we received FormData or plain object
      if (formData instanceof FormData) {
        // Use axios directly for FormData to handle file uploads
        const response = await axios.post(
          API_ENDPOINTS.PRODUCT_TYPES.BASE,
          formData,
          {
            headers: {
              'Authorization': `Token ${token}`,
              // Don't set Content-Type, let axios set it with the boundary for FormData
            }
          }
        );
        
        return response.data;
      } else {
        // Use regular JSON approach
        const response = await apiClient.post(API_ENDPOINTS.PRODUCT_TYPES.BASE, formData, token);
        return response;
      }
    } catch (error) {
      console.error('Error creating product type:', error);
      throw error;
    }
  },

  updateProductType: async (id: number, data: FormData | Partial<ProductType>): Promise<ProductType> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to update product types');
      }
      
      // Check if we received FormData or plain object
      if (data instanceof FormData) {
        // Use axios directly for FormData to handle file uploads
        const response = await axios.patch(
          API_ENDPOINTS.PRODUCT_TYPES.DETAIL(id),
          data,
          {
            headers: {
              'Authorization': `Token ${token}`,
              // Don't set Content-Type, let axios set it with the boundary for FormData
            }
          }
        );
        
        return response.data;
      } else {
        // Use regular JSON approach for simple object updates
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
   * Get only product types that should appear in the navbar
   */
  getNavbarProductTypes: async (): Promise<ProductType[]> => {
    return productTypeService.getProductTypes({ active: true, show_in_navbar: true });
  },
  
  /**
   * Set a product type's navbar visibility
   */
  setNavbarVisibility: async (id: number, showInNavbar: boolean): Promise<ProductType> => {
    return productTypeService.updateProductType(id, { show_in_navbar: showInNavbar });
  },
  
  /**
   * Toggle a product type's active status
   */
  toggleActive: async (id: number, active: boolean): Promise<ProductType> => {
    return productTypeService.updateProductType(id, { active });
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