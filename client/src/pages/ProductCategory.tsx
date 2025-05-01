// client/src/pages/ProductCategory.tsx - Updated to use context
import { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import { Tile } from '../types/types';
import { tileService } from '../services/api';
import { formatImageUrl } from '../utils/imageUtils';
import { useProductTypes, getCategoryBySlug } from '../context/ProductCategoriesContext';
import { ChevronRight, Search, X, AlertCircle } from 'lucide-react';

const ProductCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Get product types from context
  const { productTypes, loading: loadingCategories, error: categoriesError } = useProductTypes();
  
  // State for tiles and filters
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [filteredTiles, setFilteredTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  
  // Get category details from context
  const category = slug ? getCategoryBySlug(productTypes, slug) : null;
  
  // Unique materials for filter dropdown
  const [materials, setMaterials] = useState<string[]>([]);

  useEffect(() => {
    // Only fetch tiles when we have categories loaded or when slug changes
    if (!loadingCategories) {
      fetchTiles();
    }
  }, [loadingCategories, slug]);

  useEffect(() => {
    // Apply filters whenever filter states change
    applyFilters();
  }, [searchTerm, selectedMaterial, priceRange, inStockOnly, tiles]);

  const fetchTiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let tilesData;
      
      if (slug && slug !== 'tiles') {
        // If we have a specific category, fetch tiles for that category
        tilesData = await tileService.getTiles({ product_type: slug });
      } else {
        // Otherwise, fetch all tiles
        tilesData = await tileService.getTiles();
      }
      
      setTiles(tilesData);
      
      // Extract unique materials for filtering
      const uniqueMaterials = Array.from(new Set(
        tilesData
          .map(tile => tile.material)
          .filter(material => material) // Remove any undefined/null values
          .sort()
      ));
      setMaterials(uniqueMaterials as string[]);
      
    } catch (error) {
      console.error('Error fetching tiles:', error);
      setError('Failed to load tiles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...tiles];
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(tile => 
        tile.title.toLowerCase().includes(lowercasedSearch) ||
        (tile.description && tile.description.toLowerCase().includes(lowercasedSearch)) ||
        (tile.material && tile.material.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    // Apply material filter
    if (selectedMaterial) {
      results = results.filter(tile => 
        tile.material && tile.material.toLowerCase() === selectedMaterial.toLowerCase()
      );
    }
    
    // Apply price range filter
    results = results.filter(tile => {
      if (!tile.price) return true; // Include tiles without price
      const price = typeof tile.price === 'string' ? parseFloat(tile.price) : tile.price;
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    // Apply in-stock filter
    if (inStockOnly) {
      results = results.filter(tile => tile.in_stock);
    }
    
    setFilteredTiles(results);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMaterial('');
    setPriceRange({ min: 0, max: 1000 });
    setInStockOnly(false);
  };

  // Format price to currency
  const formatPrice = (price?: number | string | null) => {
    if (price === undefined || price === null) {
      return 'Price upon request';
    }
    
    // Convert string to number if needed
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if it's a valid number after conversion
    if (typeof numPrice === 'number' && !isNaN(numPrice)) {
      return `$${numPrice.toFixed(2)}`;
    }
    
    // Fallback for any other case
    return typeof price === 'string' ? price : 'Price upon request';
  };

  if (loadingCategories || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error from categories context
  if (categoriesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{categoriesError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                <Link to="/products/tiles" className="text-gray-500 hover:text-gray-700">Products</Link>
              </li>
              {category && slug !== 'tiles' && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                  <span className="text-gray-900 font-medium">{category.name}</span>
                </li>
              )}
            </ol>
          </nav>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category ? category.name : 'All Products'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {category ? category.description : 'Browse our complete collection of premium quality tiles'}
          </p>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search Box */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search tiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Material Filter */}
            <div className="w-full md:w-1/5">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Materials</option>
                {materials.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>
            
            {/* In Stock Filter */}
            <div className="w-full md:w-auto">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">In Stock Only</span>
              </label>
            </div>
            
            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredTiles.length} {filteredTiles.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        
        {/* Products Grid */}
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredTiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No products found matching your criteria.</p>
            {(searchTerm || selectedMaterial || inStockOnly) && (
              <button
                onClick={resetFilters}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTiles.map((tile) => (
              <Link 
                key={tile.id} 
                to={`/tiles/${tile.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 overflow-hidden bg-gray-200">
                  {tile.primary_image ? (
                    <img 
                      src={formatImageUrl(tile.primary_image)} 
                      alt={tile.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x300?text=${tile.title.charAt(0)}`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">{tile.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {tile.size && <span className="mr-2">{tile.size}</span>}
                    {tile.material && <span>{tile.material}</span>}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">{formatPrice(tile.price)}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tile.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tile.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Contact CTA Section */}
        <div className="mt-16 bg-blue-600 text-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
              <p className="mb-6">
                Our team of experts can help you find the perfect tile solution for your project.
                Contact us today for personalized assistance.
              </p>
              <Link 
                to="/contact"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
            </div>
            <div className="md:w-1/3 bg-blue-700 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Get a Free Quote</h3>
                <p className="mb-4">Schedule a consultation with our design team</p>
                <p className="text-2xl font-bold">(555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategory;