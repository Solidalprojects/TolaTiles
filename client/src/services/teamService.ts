// services/teamService.ts
import { apiClient } from '../api/header';
import { API_ENDPOINTS } from '../api/api';
import { getStoredAuth } from './auth';
import { TeamMember, FilterOptions } from '../types/types';
import API_BASE_URL from '../utils/apiConstants';
import axios from 'axios';

// Helper function to get clean auth token
const getAuthToken = (): string | null => {
  const { token } = getStoredAuth();
  return token && token.trim() !== '' ? token.trim() : null;
};

// Define API endpoints if not already present in API_ENDPOINTS
const TEAM_BASE = `${API_BASE_URL}/api/team/`;
const getTeamMemberDetailUrl = (id: number) => `${TEAM_BASE}${id}/`;

export const teamService = {
  getTeamMembers: async (filters?: Partial<FilterOptions>): Promise<TeamMember[]> => {
    try {
      let url = API_ENDPOINTS.TEAM?.BASE || TEAM_BASE;
      
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
      
      console.log('Fetching team members from URL:', url);
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      
      console.log('Team members fetched:', response.length || 0);
      return response;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  getTeamMemberById: async (id: number): Promise<TeamMember> => {
    try {
      const token = getAuthToken();
      const detailUrl = API_ENDPOINTS.TEAM?.DETAIL?.(id) || getTeamMemberDetailUrl(id);
      
      const response = await apiClient.get(detailUrl, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching team member with id ${id}:`, error);
      throw error;
    }
  },

  getActiveTeamMembers: async (): Promise<TeamMember[]> => {
    try {
      const url = `${TEAM_BASE}?active=true`;
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      return response;
    } catch (error) {
      console.error('Error fetching active team members:', error);
      throw error;
    }
  },

  getTeamMembersByPosition: async (position: string): Promise<TeamMember[]> => {
    try {
      const url = `${TEAM_BASE}?position=${encodeURIComponent(position)}`;
      
      const token = getAuthToken();
      const response = await apiClient.get(url, token || undefined);
      return response;
    } catch (error) {
      console.error(`Error fetching team members with position ${position}:`, error);
      throw error;
    }
  },

  createTeamMember: async (formData: FormData): Promise<TeamMember> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to create team members');
      }
      
      // Use axios for multipart/form-data
      const headers: Record<string, string> = {
        'Authorization': `Token ${token}`
      };
      
      const response = await axios.post(TEAM_BASE, formData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  updateTeamMember: async (id: number, formData: FormData): Promise<TeamMember> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to update team members');
      }
      
      const detailUrl = getTeamMemberDetailUrl(id);
      
      // Use axios for multipart/form-data
      const headers: Record<string, string> = {
        'Authorization': `Token ${token}`
      };
      
      const response = await axios.patch(detailUrl, formData, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error updating team member with id ${id}:`, error);
      throw error;
    }
  },

  deleteTeamMember: async (id: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to delete team members');
      }
      
      const detailUrl = API_ENDPOINTS.TEAM?.DETAIL?.(id) || getTeamMemberDetailUrl(id);
      
      await apiClient.delete(detailUrl, token);
      console.log(`Team member ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting team member with id ${id}:`, error);
      throw error;
    }
  },

  updateTeamMemberOrder: async (id: number, displayOrder: number): Promise<TeamMember> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to update team member order');
      }
      
      const detailUrl = getTeamMemberDetailUrl(id);
      const response = await apiClient.patch(detailUrl, { display_order: displayOrder }, token);
      return response;
    } catch (error) {
      console.error(`Error updating team member order for id ${id}:`, error);
      throw error;
    }
  },

  toggleTeamMemberActive: async (id: number, active: boolean): Promise<TeamMember> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to toggle team member active status');
      }
      
      const detailUrl = getTeamMemberDetailUrl(id);
      const response = await apiClient.patch(detailUrl, { active }, token);
      return response;
    } catch (error) {
      console.error(`Error toggling team member active status for id ${id}:`, error);
      throw error;
    }
  },

  // Function to handle team member filtering with multiple parameters
  filterTeamMembers: async (filters: {
    position?: string;
    active?: boolean;
    search?: string;
  }): Promise<TeamMember[]> => {
    try {
      let url = TEAM_BASE;
      const queryParams = new URLSearchParams();
      
      // Add all provided filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
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
      console.error('Error filtering team members:', error);
      throw error;
    }
  }
};

export default teamService;