// client/src/services/api.ts
// Fixed version to properly handle token authentication with axios

import axios from 'axios';
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { getStoredAuth } from './auth';
import { Category, Tile, Project, FilterOptions } from '../types/types';

// Helper function to get clean auth token
const getAuthToken = (): string | null => {
  const { token } = getStoredAuth();
  return token && token.trim() !== '' ? token.trim() : null;
};

// Category API service
export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE, token || undefined);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getCategoryById: async (id: number): Promise<Category> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(id), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error;
    }
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, data, token || undefined);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Token ${token}` } : {};
      
      const response = await axios.patch(
        API_ENDPOINTS.CATEGORIES.DETAIL(id),
        data,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Token ${token}` } : {};
      
      await axios.delete(
        API_ENDPOINTS.CATEGORIES.DETAIL(id),
        { headers }
      );
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }
  }
};

// Tile API service
export const tileService = {
  getTiles: async (filters?: Partial<FilterOptions>): Promise<Tile[]> => {
    try {
      let url = API_ENDPOINTS.TILES.BASE;
      
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
      
      console.log('Fetching tiles from URL:', url);
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      
      console.log('Tiles fetched:', response);
      return response;
    } catch (error) {
      console.error('Error fetching tiles:', error);
      throw error;
    }
  },

  getFeaturedTiles: async (): Promise<Tile[]> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.TILES.FEATURED, token || undefined);
      console.log('Featured tiles fetched:', response);
      return response;
    } catch (error) {
      console.error('Error fetching featured tiles:', error);
      throw error;
    }
  },

  getTilesByCategory: async (categoryIdOrSlug: number | string): Promise<Tile[]> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.TILES.BY_CATEGORY(categoryIdOrSlug), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching tiles by category ${categoryIdOrSlug}:`, error);
      throw error;
    }
  },

  getTileById: async (id: number): Promise<Tile> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.TILES.DETAIL(id), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching tile with id ${id}:`, error);
      throw error;
    }
  },

  createTile: async (formData: FormData): Promise<Tile> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      console.log('Creating tile with data:', Object.fromEntries(formData.entries()));
      
      const response = await axios.post(
        API_ENDPOINTS.TILES.BASE,
        formData,
        { headers }
      );
      
      console.log('Tile created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating tile:', error);
      throw error;
    }
  },

  updateTile: async (id: number, formData: FormData): Promise<Tile> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await axios.patch(
        API_ENDPOINTS.TILES.DETAIL(id),
        formData,
        { headers }
      );
      
      console.log('Tile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating tile with id ${id}:`, error);
      throw error;
    }
  },

  deleteTile: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Token ${token}` } : {};
      
      await axios.delete(
        API_ENDPOINTS.TILES.DETAIL(id),
        { headers }
      );
      
      console.log(`Tile ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting tile with id ${id}:`, error);
      throw error;
    }
  },
  
  // New methods for tile images
  addTileImage: async (tileId: number, imageFile: File, caption?: string, isPrimary: boolean = false): Promise<any> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      const formData = new FormData();
      formData.append('tile', tileId.toString());
      formData.append('image', imageFile);
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      if (isPrimary) {
        formData.append('is_primary', 'true');
      }
      
      const response = await axios.post(
        API_ENDPOINTS.TILES.IMAGES,
        formData,
        { 
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      console.log('Tile image added:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding image to tile ${tileId}:`, error);
      throw error;
    }
  },

  deleteTileImage: async (imageId: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      await axios.delete(
        API_ENDPOINTS.TILES.IMAGE_DETAIL(imageId),
        { 
          headers: {
            'Authorization': `Token ${token}` 
          }
        }
      );
      
      console.log(`Tile image ${imageId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting tile image ${imageId}:`, error);
      throw error;
    }
  },

  setTileImageAsPrimary: async (imageId: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      const response = await axios.post(
        API_ENDPOINTS.TILES.SET_PRIMARY(imageId),
        {},
        { 
          headers: {
            'Authorization': `Token ${token}` 
          }
        }
      );
      
      console.log(`Tile image ${imageId} set as primary:`, response.data);
    } catch (error) {
      console.error(`Error setting tile image ${imageId} as primary:`, error);
      throw error;
    }
  }
};

// Project API service
export const projectService = {
  getProjects: async (filters?: Partial<FilterOptions>): Promise<Project[]> => {
    try {
      let url = API_ENDPOINTS.PROJECTS.BASE;
      
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
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      
      // Log response for debugging
      console.log('Projects fetched:', response);
      
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getFeaturedProjects: async (): Promise<Project[]> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.FEATURED, token || undefined);
      return response;
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
  },

  getProjectById: async (id: number): Promise<Project> => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.DETAIL(id), token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching project with id ${id}:`, error);
      throw error;
    }
  },

  createProject: async (formData: FormData): Promise<Project> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      console.log('Creating project with data:', Object.fromEntries(formData.entries()));
      
      const response = await axios.post(
        API_ENDPOINTS.PROJECTS.BASE,
        formData,
        { headers }
      );
      
      console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (id: number, formData: FormData): Promise<Project> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await axios.patch(
        API_ENDPOINTS.PROJECTS.DETAIL(id),
        formData,
        { headers }
      );
      
      console.log('Project updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating project with id ${id}:`, error);
      throw error;
    }
  },

  deleteProject: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      const headers = token ? { 'Authorization': `Token ${token}` } : {};
      
      await axios.delete(
        API_ENDPOINTS.PROJECTS.DETAIL(id),
        { headers }
      );
      
      console.log(`Project ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting project with id ${id}:`, error);
      throw error;
    }
  },

  // New methods for handling project images
  addProjectImage: async (projectId: number, imageFile: File, caption?: string, isPrimary: boolean = false): Promise<any> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      const formData = new FormData();
      formData.append('project', projectId.toString());
      formData.append('image', imageFile);
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      if (isPrimary) {
        formData.append('is_primary', 'true');
      }
      
      const response = await axios.post(
        API_ENDPOINTS.PROJECTS.IMAGES,
        formData,
        { 
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      console.log('Project image added:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding image to project ${projectId}:`, error);
      throw error;
    }
  },

  deleteProjectImage: async (imageId: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      await axios.delete(
        API_ENDPOINTS.PROJECTS.IMAGE_DETAIL(imageId),
        { 
          headers: {
            'Authorization': `Token ${token}` 
          }
        }
      );
      
      console.log(`Project image ${imageId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting project image ${imageId}:`, error);
      throw error;
    }
  },

  setProjectImageAsPrimary: async (imageId: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      
      // The API endpoint for setting a project image as primary may vary
      const response = await axios.post(
        `${API_ENDPOINTS.PROJECTS.IMAGE_DETAIL(imageId)}set_as_primary/`,
        {},
        { 
          headers: {
            'Authorization': `Token ${token}` 
          }
        }
      );
      
      console.log(`Project image ${imageId} set as primary:`, response.data);
    } catch (error) {
      console.error(`Error setting project image ${imageId} as primary:`, error);
      throw error;
    }
  }
};