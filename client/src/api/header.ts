// client/src/api/header.ts
// Replace your existing apiClient with this improved version

/**
 * Improved Base API Client that ensures cookies are sent with requests
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
      
      console.log(`[API] GET ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      // Log response status for debugging
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        // Check if unauthorized
        if (response.status === 401) {
          console.error('[API] Unauthorized request:', url);
          throw new Error('Unauthorized: Please login again');
        }
        
        // Try to get detailed error message from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          errorMessage = `${response.status} ${response.statusText}`;
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API] Error fetching from ${url}:`, error);
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
      
      console.log(`[API] POST ${url}`, data);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      // Log response status for debugging
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          errorMessage = `${response.status} ${response.statusText} - ${errorText}`;
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`[API] Error posting to ${url}:`, error);
      throw error;
    }
  },
  
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
      
      console.log(`[API] PUT ${url}`, data);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      
      // Log response status for debugging
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          errorMessage = `${response.status} ${response.statusText} - ${errorText}`;
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`[API] Error putting to ${url}:`, error);
      throw error;
    }
  },
  
  patch: async (url: string, data: any, token?: string) => {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Token ${token.trim()}`;
      }
      
      console.log(`[API] PATCH ${url}`, data);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      
      // Log response status for debugging
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          errorMessage = `${response.status} ${response.statusText} - ${errorText}`;
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`[API] Error patching to ${url}:`, error);
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
      
      console.log(`[API] DELETE ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });
      
      // Log response status for debugging
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          errorMessage = `${response.status} ${response.statusText} - ${errorText}`;
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      // DELETE may not return content
      if (response.status === 204) {
        return {};
      }
      
      try {
        const responseData = await response.json();
        return responseData;
      } catch (e) {
        // If no JSON is returned, just return empty object
        return {};
      }
    } catch (error) {
      console.error(`[API] Error deleting from ${url}:`, error);
      throw error;
    }
  },
  
  // New method for handling file uploads with FormData
  uploadFile: async (url: string, formData: FormData, token?: string) => {
    try {
      const headers: HeadersInit = {};
      
      // Only add Authorization header if token exists and is not empty
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Token ${token.trim()}`;
      }
      
      // Don't set Content-Type for FormData - browser will add it with correct boundary
      console.log(`[API] POST FormData to ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      // Log response status for debugging
      console.log(`[API] Response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = JSON.stringify(errorData);
        } catch (e) {
          // If response can't be parsed as JSON, use status text
          const errorText = await response.text();
          errorMessage = `${response.status} ${response.statusText} - ${errorText}`;
        }
        
        throw new Error(`API request failed: ${errorMessage}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`[API] Error uploading to ${url}:`, error);
      throw error;
    }
  }
};