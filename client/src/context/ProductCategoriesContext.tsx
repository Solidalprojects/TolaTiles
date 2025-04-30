// client/src/context/ProductCategoriesContext.tsx - Updated with navbar visibility support
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProductType } from '../types/types';
import { productTypeService } from '../services/productTypeService';
import { API_ENDPOINTS } from '../api/api';
import { apiClient } from '../api/header';
import { getStoredAuth } from '../services/auth';

// Define the context shape
interface ProductTypeContextType {
  productTypes: ProductType[];
  loading: boolean;
  error: string | null;
  refreshProductTypes: () => Promise<void>;
}

// Create the context with default values
const ProductTypeContext = createContext<ProductTypeContextType>({
  productTypes: [],
  loading: true,
  error: null,
  refreshProductTypes: async () => {},
});

// Custom hook to use the product type context
export const useProductTypes = () => useContext(ProductTypeContext);

interface ProductTypeProviderProps {
  children: ReactNode;
}

export const ProductTypeProvider: React.FC<ProductTypeProviderProps> = ({ children }) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch product types with proper error handling
  const fetchProductTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { token } = getStoredAuth();
      console.log('Fetching product types with token:', token ? 'Token exists' : 'No token');
      
      // First try to get data from API endpoint
      try {
        const data = await apiClient.get(API_ENDPOINTS.PRODUCT_TYPES.BASE, token || undefined);
        console.log('Product types fetched successfully:', data);
        
        if (Array.isArray(data)) {
          setProductTypes(data);
          return;
        }
      } catch (apiError) {
        console.error('Error fetching from API_ENDPOINTS:', apiError);
        // Continue to fallback approach
      }
      
      // Fallback to productTypeService if the first approach failed
      try {
        const data = await productTypeService.getProductTypes({ active: true });
        console.log('Product types fetched through service:', data);
        setProductTypes(data);
      } catch (serviceError) {
        console.error('Error fetching from productTypeService:', serviceError);
        throw serviceError; // Re-throw to trigger fallback data
      }
    } catch (err) {
      console.error('All product type fetch attempts failed:', err);
      setError('Failed to load product types');
      
      // Provide fallback data if API fails
      setProductTypes([
        { id: 1, name: 'All Tiles', slug: 'tiles', description: 'Browse our complete collection of premium quality tiles', image_url: '', active: true, display_order: 1, show_in_navbar: true, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 2, name: 'Backsplashes', slug: 'backsplashes', description: 'Beautiful backsplash options for your kitchen and bathroom', image_url: '', active: true, display_order: 2, show_in_navbar: true, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 3, name: 'Fireplaces', slug: 'fireplaces', description: 'Elegant fireplace tile solutions to add warmth to any room', image_url: '', active: true, display_order: 3, show_in_navbar: true, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 4, name: 'Flooring', slug: 'flooring', description: 'Durable and stylish flooring tiles for any space', image_url: '', active: true, display_order: 4, show_in_navbar: true, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 5, name: 'Patios', slug: 'patios', description: 'Outdoor patio tiles that withstand the elements', image_url: '', active: true, display_order: 5, show_in_navbar: true, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 6, name: 'Showers', slug: 'showers', description: 'Modern shower tiles that combine beauty and function', image_url: '', active: true, display_order: 6, show_in_navbar: true, created_at: '', updated_at: '', tiles_count: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Call fetchProductTypes on initial render
  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  // Context value object
  const value: ProductTypeContextType = {
    productTypes,
    loading,
    error,
    refreshProductTypes: fetchProductTypes,
  };

  return (
    <ProductTypeContext.Provider value={value}>
      {children}
    </ProductTypeContext.Provider>
  );
};

// Helper functions

// Get a category by its slug
export const getCategoryBySlug = (productTypes: ProductType[], slug: string): ProductType | undefined => {
  return productTypes.find(category => category.slug === slug);
};

// Sort product types by display_order
export const sortedProductTypes = (productTypes: ProductType[]): ProductType[] => {
  return [...productTypes].sort((a, b) => a.display_order - b.display_order);
};

// Get only product types that should appear in the navbar
export const getNavbarProductTypes = (productTypes: ProductType[]): ProductType[] => {
  return sortedProductTypes(productTypes).filter(type => type.active && type.show_in_navbar);
};

// Export the provider as default
export default ProductTypeProvider;