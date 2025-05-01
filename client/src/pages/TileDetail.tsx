// client/src/pages/TileDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tile, Category } from '../types/types';
import { tileService, categoryService } from '../services/api';
import { formatImageUrl } from '../utils/imageUtils';
import { ChevronLeft, ChevronRight, ArrowLeft, Star, ShoppingCart, Ruler, Box, DollarSign, Info } from 'lucide-react';

const TileDetail = () => {
  const { id, slug } = useParams<{ id?: string, slug?: string }>();
  const [tile, setTile] = useState<Tile | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [relatedTiles, setRelatedTiles] = useState<Tile[]>([]);

  useEffect(() => {
    const fetchTileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let tileData;
        // Fetch tile either by ID or slug
        if (id && !isNaN(parseInt(id))) {
          tileData = await tileService.getTileById(parseInt(id));
        } else if (slug) {
          // You'll need to add a method to fetch by slug in your tileService
          // For now, we'll simulate it by fetching all tiles and filtering
          const allTiles = await tileService.getTiles();
          tileData = allTiles.find(t => t.slug === slug) || null;
          
          if (!tileData) {
            throw new Error(`Tile with slug "${slug}" not found`);
          }
        } else {
          throw new Error('No ID or slug provided');
        }
        
        setTile(tileData);
        
        // Fetch the category data
        if (tileData.category) {
          const categoryData = await categoryService.getCategoryById(tileData.category);
          setCategory(categoryData);
          
          // Fetch related tiles from the same category
          const categoryTiles = await tileService.getTilesByCategory(tileData.category);
          // Filter out the current tile and limit to 4 related tiles
          const filtered = categoryTiles
            .filter(t => t.id !== tileData.id)
            .slice(0, 4);
          setRelatedTiles(filtered);
        }
      } catch (err) {
        console.error('Error fetching tile details:', err);
        setError('Failed to load tile details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTileData();
  }, [id, slug]);
  
  const handlePrevImage = () => {
    if (!tile || !tile.images || tile.images.length === 0) return;
    
    setActiveImageIndex(prevIndex => 
      prevIndex === 0 ? tile.images!.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    if (!tile || !tile.images || tile.images.length === 0) return;
    
    setActiveImageIndex(prevIndex => 
      prevIndex === tile.images!.length - 1 ? 0 : prevIndex + 1
    );
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tile details...</p>
        </div>
      </div>
    );
  }

  if (error || !tile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Tile
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Tile not found'}</p>
                <div className="mt-4">
                  <Link to="/" className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-600">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare image array for carousel
  const images = tile.images && tile.images.length > 0 
    ? tile.images 
    : (tile.primary_image 
        ? [{ id: 0, image_url: tile.primary_image, is_primary: true, created_at: '', image: '' }] 
        : []);

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
                <Link to="/categories" className="text-gray-500 hover:text-gray-700">Categories</Link>
              </li>
              {category && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                  <Link to={`/categories/${category.id}`} className="text-gray-500 hover:text-gray-700">
                    {category.name}
                  </Link>
                </li>
              )}
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                <span className="text-gray-900 font-medium">{tile.title}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Image Gallery Section */}
            <div className="md:w-1/2 p-4">
              {/* Main Image with Navigation */}
              <div className="relative rounded-lg overflow-hidden bg-gray-200" style={{ height: '400px' }}>
                {images.length > 0 ? (
                  <img 
                    src={formatImageUrl(images[activeImageIndex].image_url)} 
                    alt={tile.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-opacity"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-opacity"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-800" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative rounded-md overflow-hidden h-16 ${
                        index === activeImageIndex ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                      }`}
                    >
                      <img 
                        src={formatImageUrl(image.image_url)} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.is_primary && (
                        <div className="absolute top-0 right-0 bg-yellow-400 p-1 rounded-bl-md">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Details Section */}
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tile.title}</h1>
              
              {category && (
                <div className="mb-4">
                  <Link to={`/categories/${category.id}`} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {category.name}
                  </Link>
                </div>
              )}
              
              {tile.featured && (
                <div className="mb-4">
                  <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    Featured Product
                  </span>
                </div>
              )}
              
              <div className="text-2xl font-semibold text-gray-800 mb-6">
                {formatPrice(tile.price)}
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{tile.description || 'No description provided.'}</p>
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Ruler className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    <span className="font-medium">Size:</span> {tile.size || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Box className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    <span className="font-medium">Material:</span> {tile.material || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    <span className="font-medium">SKU:</span> {tile.sku || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${tile.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-700">
                    <span className="font-medium">Status:</span> {tile.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Request a Quote
                </button>
                
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Contact us for bulk pricing and availability
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedTiles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tiles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTiles.map(relatedTile => (
                <Link 
                  key={relatedTile.id} 
                  to={`/tiles/${relatedTile.slug || relatedTile.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    {relatedTile.primary_image ? (
                      <img 
                        src={formatImageUrl(relatedTile.primary_image)} 
                        alt={relatedTile.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{relatedTile.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {relatedTile.size && <span className="mr-2">{relatedTile.size}</span>}
                      {relatedTile.material && <span>{relatedTile.material}</span>}
                    </p>
                    {relatedTile.price && (
                      <p className="font-medium text-gray-900">{formatPrice(relatedTile.price)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TileDetail;