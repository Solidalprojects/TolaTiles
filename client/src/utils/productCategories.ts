// client/src/utils/productCategories.ts
// Hardcoded product categories

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  path: string;
}

// These product categories are hardcoded and will match navbar items
const productCategories: ProductCategory[] = [
  {
    id: 1,
    name: 'All Tiles',
    slug: 'tiles',
    description: 'Browse our complete collection of premium quality tiles',
    path: '/products/tiles'
  },
  {
    id: 2,
    name: 'Backsplashes',
    slug: 'backsplashes',
    description: 'Beautiful backsplash options for your kitchen and bathroom',
    path: '/products/backsplashes'
  },
  {
    id: 3,
    name: 'Fireplaces',
    slug: 'fireplaces',
    description: 'Elegant fireplace tile solutions to add warmth to any room',
    path: '/products/fireplaces'
  },
  {
    id: 4,
    name: 'Flooring',
    slug: 'flooring',
    description: 'Durable and stylish flooring tiles for any space',
    path: '/products/flooring'
  },
  {
    id: 5,
    name: 'Patios',
    slug: 'patios',
    description: 'Outdoor patio tiles that withstand the elements',
    path: '/products/patios'
  },
  {
    id: 6,
    name: 'Showers',
    slug: 'showers',
    description: 'Modern shower tiles that combine beauty and function',
    path: '/products/showers'
  }
];

export default productCategories;

// Helper function to get a category by slug
export const getCategoryBySlug = (slug: string): ProductCategory | undefined => {
  return productCategories.find(category => category.slug === slug);
};