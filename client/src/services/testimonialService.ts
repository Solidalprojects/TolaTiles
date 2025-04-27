// services/testimonialService.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { getStoredAuth } from './auth';
import { CustomerTestimonial, FilterOptions } from '../types/types';
import API_BASE_URL from '../utils/apiConstants';

// Helper function to get clean auth token
const getAuthToken = (): string | null => {
  const { token } = getStoredAuth();
  return token && token.trim() !== '' ? token.trim() : null;
};

// Define API endpoints if not already present in API_ENDPOINTS
const TESTIMONIALS_BASE = `${API_BASE_URL}/api/testimonials/`;
const getTestimonialDetailUrl = (id: number) => `${TESTIMONIALS_BASE}${id}/`;
const getTestimonialsByProjectUrl = (projectId: number) => `${TESTIMONIALS_BASE}?project=${projectId}`;
const getTestimonialsByRatingUrl = (rating: number) => `${TESTIMONIALS_BASE}?rating=${rating}`;
const approveTestimonialUrl = (id: number) => `${TESTIMONIALS_BASE}${id}/approve/`;

export const testimonialService = {
  getTestimonials: async (filters?: Partial<FilterOptions>): Promise<CustomerTestimonial[]> => {
    try {
      let url = API_ENDPOINTS.TESTIMONIALS?.BASE || TESTIMONIALS_BASE;
      
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
      const detailUrl = API_ENDPOINTS.TESTIMONIALS?.DETAIL?.(id) || getTestimonialDetailUrl(id);
      
      const response = await apiClient.get(detailUrl, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching testimonial with id ${id}:`, error);
      throw error;
    }
  },

  getTestimonialsByProject: async (projectId: number): Promise<CustomerTestimonial[]> => {
    try {
      const token = getAuthToken();
      const byProjectUrl = API_ENDPOINTS.TESTIMONIALS?.BY_PROJECT?.(projectId) || getTestimonialsByProjectUrl(projectId);
      
      const response = await apiClient.get(byProjectUrl, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching testimonials for project ${projectId}:`, error);
      throw error;
    }
  },

  getTestimonialsByRating: async (rating: number): Promise<CustomerTestimonial[]> => {
    try {
      const token = getAuthToken();
      const byRatingUrl = API_ENDPOINTS.TESTIMONIALS?.BY_RATING?.(rating) || getTestimonialsByRatingUrl(rating);
      
      const response = await apiClient.get(byRatingUrl, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching testimonials with rating ${rating}:`, error);
      throw error;
    }
  },

  getApprovedTestimonials: async (): Promise<CustomerTestimonial[]> => {
    try {
      const url = `${TESTIMONIALS_BASE}?approved=true`;
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      return response;
    } catch (error) {
      console.error('Error fetching approved testimonials:', error);
      throw error;
    }
  },

  getPendingTestimonials: async (): Promise<CustomerTestimonial[]> => {
    try {
      // This endpoint likely requires admin authentication
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to view pending testimonials');
      }
      
      const url = `${TESTIMONIALS_BASE}?approved=false`;
      
      const response = await apiClient.get(url, token);
      return response;
    } catch (error) {
      console.error('Error fetching pending testimonials:', error);
      throw error;
    }
  },

  submitTestimonial: async (data: Partial<CustomerTestimonial>): Promise<CustomerTestimonial> => {
    try {
      const url = API_ENDPOINTS.TESTIMONIALS?.SUBMIT || TESTIMONIALS_BASE;
      
      // For public testimonial submission, token is optional
      const token = getAuthToken();
      
      // Set approved to false by default for user submissions
      const submissionData = {
        ...data,
        approved: token ? data.approved : false // Only allow setting approved if authenticated
      };
      
      const response = await apiClient.post(url, submissionData, token || undefined);
      return response;
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      throw error;
    }
  },

  updateTestimonial: async (id: number, data: Partial<CustomerTestimonial>): Promise<CustomerTestimonial> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to update testimonials');
      }
      
      const detailUrl = API_ENDPOINTS.TESTIMONIALS?.DETAIL?.(id) || getTestimonialDetailUrl(id);
      
      const response = await apiClient.patch(detailUrl, data, token);
      return response;
    } catch (error) {
      console.error(`Error updating testimonial with id ${id}:`, error);
      throw error;
    }
  },

  deleteTestimonial: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to delete testimonials');
      }
      
      const detailUrl = API_ENDPOINTS.TESTIMONIALS?.DETAIL?.(id) || getTestimonialDetailUrl(id);
      
      await apiClient.delete(detailUrl, token);
      console.log(`Testimonial ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting testimonial with id ${id}:`, error);
      throw error;
    }
  },

  approveTestimonial: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to approve testimonials');
      }
      
      // First try with the regular update method since APPROVE endpoint might not be available
      const detailUrl = getTestimonialDetailUrl(id);
      
      try {
        await apiClient.patch(detailUrl, { approved: true }, token);
        console.log(`Testimonial ${id} approved successfully using patch update`);
      } catch (error) {
        // If the patch method fails, try with a custom approve endpoint if exists
        console.log('Patch update failed, trying approve endpoint');
        const approveUrl = approveTestimonialUrl(id);
        await apiClient.post(approveUrl, {}, token);
        console.log(`Testimonial ${id} approved successfully using approve endpoint`);
      }
    } catch (error) {
      console.error(`Error approving testimonial with id ${id}:`, error);
      throw error;
    }
  },

  unapproveTestimonial: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to unapprove testimonials');
      }
      
      const detailUrl = API_ENDPOINTS.TESTIMONIALS?.DETAIL?.(id) || getTestimonialDetailUrl(id);
      
      await apiClient.patch(detailUrl, { approved: false }, token);
      console.log(`Testimonial ${id} unapproved successfully`);
    } catch (error) {
      console.error(`Error unapproving testimonial with id ${id}:`, error);
      throw error;
    }
  },

  // Function to handle testimonial filtering with multiple parameters
  filterTestimonials: async (filters: {
    project?: number;
    rating?: number;
    minRating?: number;
    approved?: boolean;
    location?: string;
    search?: string;
  }): Promise<CustomerTestimonial[]> => {
    try {
      let url = TESTIMONIALS_BASE;
      const queryParams = new URLSearchParams();
      
      // Add all provided filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for API compatibility
          const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          queryParams.append(apiKey, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      return response;
    } catch (error) {
      console.error('Error filtering testimonials:', error);
      throw error;
    }
  }
};

export default testimonialService;