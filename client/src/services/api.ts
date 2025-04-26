// client/src/services/api.ts
import axios from 'axios';
import { authHeader } from './auth';
import { 
  Category, 
  Tile, 
  Project,
  ProjectImage,
  ContactForm,
  SubscribeForm,
  FilterOptions,
  PaginatedResponse
} from '../types/types';

const API_URL = 'http://localhost:8000/api/';

/**
 * Base API class with common methods for all services
 */
class ApiService {
  baseUrl: string;
  
  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Helper method to build API URL with endpoint
   */
  getUrl(endpoint: string): string {
    // Ensure endpoint starts with a slash if baseUrl doesn't end with one
    if (!this.baseUrl.endsWith('/') && !endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    return `${this.baseUrl}${endpoint}`;
  }
  
  /**
   * Helper method to build query string from filter options
   */
  buildQueryString(filters?: FilterOptions): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }
}

/**
 * Category API service
 */
class CategoryService extends ApiService {
  /**
   * Get all categories with optional filters
   */
  async getCategories(filters?: FilterOptions): Promise<Category[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await axios.get<Category[]>(
        this.getUrl(`categories/${queryString}`),
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific category by ID or slug
   */
  async getCategory(idOrSlug: number | string): Promise<Category> {
    try {
      const response = await axios.get<Category>(
        this.getUrl(`categories/${idOrSlug}/`),
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${idOrSlug}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new category (admin only)
   */
  async createCategory(category: Partial<Category>): Promise<Category> {
    try {
      const response = await axios.post<Category>(
        this.getUrl('categories/'),
        category,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing category (admin only)
   */
  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    try {
      const response = await axios.patch<Category>(
        this.getUrl(`categories/${id}/`),
        category,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      await axios.delete(
        this.getUrl(`categories/${id}/`),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
}

/**
 * Tile API service
 */
class TileService extends ApiService {
  /**
   * Get all tiles with optional filters
   */
  async getTiles(filters?: FilterOptions): Promise<Tile[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await axios.get<Tile[]>(
        this.getUrl(`tiles/${queryString}`),
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tiles:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific tile by ID or slug
   */
  async getTile(idOrSlug: number | string): Promise<Tile> {
    try {
      const response = await axios.get<Tile>(
        this.getUrl(`tiles/${idOrSlug}/`),
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching tile ${idOrSlug}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new tile (admin only)
   */
  async createTile(tile: FormData): Promise<Tile> {
    try {
      const response = await axios.post<Tile>(
        this.getUrl('tiles/'),
        tile,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating tile:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing tile (admin only)
   */
  async updateTile(id: number, tile: FormData): Promise<Tile> {
    try {
      const response = await axios.patch<Tile>(
        this.getUrl(`tiles/${id}/`),
        tile,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating tile ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a tile (admin only)
   */
  async deleteTile(id: number): Promise<void> {
    try {
      await axios.delete(
        this.getUrl(`tiles/${id}/`),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting tile ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get featured tiles
   */
  async getFeaturedTiles(): Promise<Tile[]> {
    return this.getTiles({ featured: true });
  }
  
  /**
   * Get tiles by category ID or slug
   */
  async getTilesByCategory(categoryIdOrSlug: number | string): Promise<Tile[]> {
    return this.getTiles({ category: categoryIdOrSlug });
  }
}

/**
 * Project API service
 */
class ProjectService extends ApiService {
  /**
   * Get all projects with optional filters
   */
  async getProjects(filters?: FilterOptions): Promise<Project[]> {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await axios.get<Project[]>(
        this.getUrl(`projects/${queryString}`),
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific project by ID or slug
   */
  async getProject(idOrSlug: number | string): Promise<Project> {
    try {
      const response = await axios.get<Project>(
        this.getUrl(`projects/${idOrSlug}/`),
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${idOrSlug}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new project (admin only)
   */
  async createProject(project: FormData): Promise<Project> {
    try {
      const response = await axios.post<Project>(
        this.getUrl('projects/'),
        project,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing project (admin only)
   */
  async updateProject(id: number, project: FormData): Promise<Project> {
    try {
      const response = await axios.patch<Project>(
        this.getUrl(`projects/${id}/`),
        project,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a project (admin only)
   */
  async deleteProject(id: number): Promise<void> {
    try {
      await axios.delete(
        this.getUrl(`projects/${id}/`),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get featured projects
   */
  async getFeaturedProjects(): Promise<Project[]> {
    return this.getProjects({ featured: true });
  }
  
  /**
   * Add image to a project (admin only)
   */
  async addProjectImage(projectId: number, imageData: FormData): Promise<ProjectImage> {
    try {
      // Add project ID to form data
      imageData.append('project', projectId.toString());
      
      const response = await axios.post<ProjectImage>(
        this.getUrl('project-images/'),
        imageData,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding image to project ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a project image (admin only)
   */
  async deleteProjectImage(imageId: number): Promise<void> {
    try {
      await axios.delete(
        this.getUrl(`project-images/${imageId}/`),
        { headers: authHeader() }
      );
    } catch (error) {
      console.error(`Error deleting project image ${imageId}:`, error);
      throw error;
    }
  }
}

/**
 * Contact API service
 */
class ContactService extends ApiService {
  /**
   * Submit a contact form
   */
  async submitContactForm(contactData: ContactForm): Promise<any> {
    try {
      const response = await axios.post(
        this.getUrl('contacts/'),
        contactData
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
  
  /**
   * Subscribe to newsletter
   */
  async subscribe(subscribeData: SubscribeForm): Promise<any> {
    try {
      const response = await axios.post(
        this.getUrl('newsletter/subscribe/'),
        subscribeData
      );
      return response.data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
  
  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(email: string): Promise<any> {
    try {
      const response = await axios.post(
        this.getUrl('newsletter/unsubscribe/'),
        { email }
      );
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw error;
    }
  }
}

// Instantiate services
export const categoryService = new CategoryService();
export const tileService = new TileService();
export const projectService = new ProjectService();
export const contactService = new ContactService();

// Export services
export { CategoryService, TileService, ProjectService, ContactService };