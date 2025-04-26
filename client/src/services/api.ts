// client/src/services/api.ts
import axios from 'axios';
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { authHeader } from './auth';
import { Category, Tile, Project, FilterOptions } from '../types/types';

// Category API service
export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE, authHeader().Authorization);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getCategoryById: async (id: number): Promise<Category> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(id), authHeader().Authorization);
      return response;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error;
    }
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, data, authHeader().Authorization);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.CATEGORIES.DETAIL(id),
        data,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axios.delete(
        API_ENDPOINTS.CATEGORIES.DETAIL(id),
        { headers: authHeader() }
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
      
      const response = await apiClient.get(url, authHeader().Authorization);
      return response;
    } catch (error) {
      console.error('Error fetching tiles:', error);
      throw error;
    }
  },

  getTileById: async (id: number): Promise<Tile> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TILES.DETAIL(id), authHeader().Authorization);
      return response;
    } catch (error) {
      console.error(`Error fetching tile with id ${id}:`, error);
      throw error;
    }
  },

  createTile: async (formData: FormData): Promise<Tile> => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.TILES.BASE,
        formData,
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating tile:', error);
      throw error;
    }
  },

  updateTile: async (id: number, formData: FormData): Promise<Tile> => {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.TILES.DETAIL(id),
        formData,
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating tile with id ${id}:`, error);
      throw error;
    }
  },

  deleteTile: async (id: number): Promise<void> => {
    try {
      await axios.delete(
        API_ENDPOINTS.TILES.DETAIL(id),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting tile with id ${id}:`, error);
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
      
      const response = await apiClient.get(url, authHeader().Authorization);
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getProjectById: async (id: number): Promise<Project> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.DETAIL(id), authHeader().Authorization);
      return response;
    } catch (error) {
      console.error(`Error fetching project with id ${id}:`, error);
      throw error;
    }
  },

  createProject: async (formData: FormData): Promise<Project> => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.PROJECTS.BASE,
        formData,
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (id: number, formData: FormData): Promise<Project> => {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.PROJECTS.DETAIL(id),
        formData,
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating project with id ${id}:`, error);
      throw error;
    }
  },

  deleteProject: async (id: number): Promise<void> => {
    try {
      await axios.delete(
        API_ENDPOINTS.PROJECTS.DETAIL(id),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting project with id ${id}:`, error);
      throw error;
    }
  }
};