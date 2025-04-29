import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductType } from '../types/types';
import { API_ENDPOINTS } from '../api/api';
import { apiClient } from '../api/header';

// Define the context shape
interface ProductCategoriesContextType {
  productTypes: ProductType[];
  loading: boolean;
  error: string | null;
  refreshProductTypes: () => Promise<void>;
}

// Create the context with default values
// This is declared in the same file and then used below
const ProductTypeContext = createContext<ProductCategoriesContextType>({
  productTypes: [],
  loading: false,
  error: null,
  refreshProductTypes: async () => {}
});

// Hook to use the context
export const useProductCategories = () => useContext(ProductTypeContext);

// Provider component
interface ProductCategoriesProviderProps {
  children: ReactNode;
}

export const ProductCategoriesProvider: React.FC<ProductCategoriesProviderProps> = ({ children }) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching product types from API...');
      const data = await apiClient.get(API_ENDPOINTS.PRODUCT_TYPES.BASE);
      
      console.log('Product types fetched:', data);
      setProductTypes(data);
    } catch (err: any) {
      console.error('Error fetching product types:', err);
      setError('Failed to load product categories. Please try again later.');
      
      // Set some default categories as fallback
      setProductTypes([
        { id: 1, name: 'Tiles', slug: 'tiles', description: 'Premium quality tiles for any surface', image_url: '', active: true, display_order: 1, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 2, name: 'Backsplashes', slug: 'backsplashes', description: 'Beautiful backsplashes for your kitchen', image_url: '', active: true, display_order: 2, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 3, name: 'Fireplaces', slug: 'fireplaces', description: 'Elegant fireplace solutions', image_url: '', active: true, display_order: 3, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 4, name: 'Flooring', slug: 'flooring', description: 'Durable and stylish flooring options', image_url: '', active: true, display_order: 4, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 5, name: 'Patios', slug: 'patios', description: 'Outdoor patio designs and materials', image_url: '', active: true, display_order: 5, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 6, name: 'Showers', slug: 'showers', description: 'Modern shower tile solutions', image_url: '', active: true, display_order: 6, created_at: '', updated_at: '', tiles_count: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchProductTypes();
  }, []);

  // Context value
  const value = {
    productTypes,
    loading,
    error,
    refreshProductTypes: fetchProductTypes
  };

  // Using the ProductTypeContext that was declared above in this same file
  return (
    <ProductTypeContext.Provider value={value}>
      {children}
    </ProductTypeContext.Provider>
  );
};