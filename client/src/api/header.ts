// client/src/api/header.ts

/**
 * Base API Client that ensures cookies are sent with requests
 * This is important for session tracking
 */
export const apiClient = {
  get: async (url: string, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Important: this ensures cookies are sent
        headers,
      });
      
      if (!response.ok) {
        // Create a more detailed error message
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  },
  
  post: async (url: string, data: any, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Important: this ensures cookies are sent
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error posting to ${url}:`, error);
      throw error;
    }
  },
  
  // Add other methods (PUT, DELETE, etc.) with similar error handling
  put: async (url: string, data: any, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error putting to ${url}:`, error);
      throw error;
    }
  },
  
  delete: async (url: string, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      
      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
      
      // DELETE may not return content
      if (response.status === 204) {
        return {};
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error deleting from ${url}:`, error);
      throw error;
    }
  }
};