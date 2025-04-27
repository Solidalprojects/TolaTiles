// client/src/api/header.ts
// Fixed version to properly handle token authentication

/**
 * Base API Client that ensures cookies are sent with requests
 * and properly handles authentication tokens
 */
export const apiClient = {
  get: async (url: string, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Token ${token.trim()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        // Check if unauthorized
        if (response.status === 401) {
          console.error('Unauthorized request:', url);
          // You might want to trigger a logout or token refresh here
        }
        
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
      
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Token ${token.trim()}`;
      }
      
      console.log('Making POST request to:', url);
      console.log('With headers:', headers);
      console.log('With data:', data);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      // Log response status for debugging
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
          console.error('Error response data:', errorData);
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          errorMessage = `${response.status} ${response.statusText} - ${errorText}`;
          console.error('Error response text:', errorText);
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error posting to ${url}:`, error);
      throw error;
    }
  },
  
  // Other methods with the same token handling fix
  put: async (url: string, data: any, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Token ${token.trim()}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
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
      
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Token ${token.trim()}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
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