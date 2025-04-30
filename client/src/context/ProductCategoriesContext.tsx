// client/src/contexts/ProductCategoriesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductType } from '../types/types';
import { productTypeService } from '../services/productTypeService';

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

  // Function to fetch product types
  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productTypeService.getProductTypes({ active: true });
      setProductTypes(data);
    } catch (err) {
      console.error('Error fetching product types:', err);
      setError('Failed to load product types');
      
      // Provide fallback data if API fails
      setProductTypes([
        { id: 1, name: 'All Tiles', slug: 'tiles', description: 'Browse our complete collection of premium quality tiles', image_url: '', active: true, display_order: 1, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 2, name: 'Backsplashes', slug: 'backsplashes', description: 'Beautiful backsplash options for your kitchen and bathroom', image_url: '', active: true, display_order: 2, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 3, name: 'Fireplaces', slug: 'fireplaces', description: 'Elegant fireplace tile solutions to add warmth to any room', image_url: '', active: true, display_order: 3, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 4, name: 'Flooring', slug: 'flooring', description: 'Durable and stylish flooring tiles for any space', image_url: '', active: true, display_order: 4, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 5, name: 'Patios', slug: 'patios', description: 'Outdoor patio tiles that withstand the elements', image_url: '', active: true, display_order: 5, created_at: '', updated_at: '', tiles_count: 0 },
        { id: 6, name: 'Showers', slug: 'showers', description: 'Modern shower tiles that combine beauty and function', image_url: '', active: true, display_order: 6, created_at: '', updated_at: '', tiles_count: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchProductTypes on initial render
  useEffect(() => {
    fetchProductTypes();
  }, []);

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

// Export the provider as default
export default ProductTypeProvider;