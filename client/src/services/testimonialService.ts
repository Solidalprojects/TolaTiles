// client/src/services/testimonialService.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { getStoredAuth } from './auth';
import { CustomerTestimonial, FilterOptions } from '../types/types';
import axios from 'axios';

// Helper function to get clean auth token
const getAuthToken = (): string | null => {
  const { token } = getStoredAuth();
  return token && token.trim() !== '' ? token.trim() : null;
};

export const testimonialService = {
  getTestimonials: async (filters?: Partial<FilterOptions>): Promise<CustomerTestimonial[]> => {
    try {
      let url = API_ENDPOINTS.TESTIMONIALS.BASE;
      
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
      
      console.log('Fetching testimonials from URL:', url);
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      
      console.log('Testimonials fetched:', response.length || 0);
      return response;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  getTestimonialById: async (id: number): Promise<CustomerTestimonial> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.TESTIMONIALS.DETAIL(id), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching testimonial with id ${id}:`, error);
      throw error;
    }
  },

  createTestimonial: async (formData: FormData): Promise<CustomerTestimonial> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await axios.post(
        API_ENDPOINTS.TESTIMONIALS.BASE,
        formData,
        { headers }
      );
      
      console.log('Testimonial created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },

  updateTestimonial: async (id: number, formData: FormData): Promise<CustomerTestimonial> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await axios.patch(
        API_ENDPOINTS.TESTIMONIALS.DETAIL(id),
        formData,
        { headers }
      );
      
      console.log('Testimonial updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating testimonial with id ${id}:`, error);
      throw error;
    }
  },

  deleteTestimonial: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      await apiClient.delete(API_ENDPOINTS.TESTIMONIALS.DETAIL(id), token || undefined);
      console.log(`Testimonial ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting testimonial with id ${id}:`, error);
      throw error;
    }
  },

  toggleApproval: async (id: number): Promise<CustomerTestimonial> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to approve testimonials');
      }
      
      const response = await apiClient.post(API_ENDPOINTS.TESTIMONIALS.DETAIL(id) + 'approve/', {}, token);
      console.log(`Testimonial ${id} approval toggled successfully`);
      return response;
    } catch (error) {
      console.error(`Error toggling approval for testimonial ${id}:`, error);
      throw error;
    }
  },
  
  getApprovedTestimonials: async (): Promise<CustomerTestimonial[]> => {
    return testimonialService.getTestimonials({ approved: true });
  },
  
  getPendingTestimonials: async (): Promise<CustomerTestimonial[]> => {
    return testimonialService.getTestimonials({ approved: false });
  }
};

export default testimonialService;