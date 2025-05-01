// client/src/pages/home.tsx - Simplified carousel implementation
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Tile, ProductType, Project } from '../types/types';
import { tileService } from '../services/api';
import { projectService } from '../services/api';
import { productTypeService } from '../services/productTypeService';
import { formatImageUrl } from '../utils/imageUtils';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

const Home = () => {
  // State for featured items
  const [featuredTiles, setFeaturedTiles] = useState<Tile[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  
  // State for carousel
  const [activeTileIndex, setActiveTileIndex] = useState(0);

  useEffect(() => {
    fetchData();
    
    // Set up interval for auto-rotation
    const interval = setInterval(() => {
      if (featuredTiles.length > 1) {
        setActiveTileIndex(current => 
          current === featuredTiles.length - 1 ? 0 : current + 1
        );
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredTiles.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tiles with featured filter
      const tilesData = await tileService.getTiles({ featured: true });
      setFeaturedTiles(tilesData.length > 0 ? tilesData : await tileService.getTiles());
      
      // Fetch product types
      try {
        const productTypesData = await productTypeService.getProductTypes();
        setProductTypes(productTypesData);
      } catch (error) {
        console.error('Error fetching product types, will use mock data:', error);
        // Mock data for product types if the service isn't implemented yet
        setProductTypes([
          { id: 1, name: 'Tiles', slug: 'tiles', description: 'Premium quality tiles for any surface', image_url: '/images/tiles.jpg', active: true, display_order: 1, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 2, name: 'Backsplashes', slug: 'backsplashes', description: 'Beautiful backsplashes for your kitchen', image_url: '/images/backsplash.jpg', active: true, display_order: 2, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 3, name: 'Fireplaces', slug: 'fireplaces', description: 'Elegant fireplace solutions', image_url: '/images/fireplace.jpg', active: true, display_order: 3, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 4, name: 'Flooring', slug: 'flooring', description: 'Durable and stylish flooring options', image_url: '/images/flooring.jpg', active: true, display_order: 4, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 5, name: 'Patios', slug: 'patios', description: 'Outdoor patio designs and materials', image_url: '/images/patio.jpg', active: true, display_order: 5, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 6, name: 'Showers', slug: 'showers', description: 'Modern shower tile solutions', image_url: '/images/shower.jpg', active: true, display_order: 6, created_at: '', updated_at: '', tiles_count: 0 },
        ]);
      }
      
      // Fetch projects - just get 3 featured projects for the homepage
      const projectsData = await projectService.getProjects({ featured: true });
      setFeaturedProjects(projectsData.length > 0 ? projectsData.slice(0, 3) : await projectService.getProjects());
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Simple carousel navigation functions
  const prevTile = () => {
    setActiveTileIndex(current => 
      current === 0 ? featuredTiles.length - 1 : current - 1
    );
  };

  const nextTile = () => {
    setActiveTileIndex(current => 
      current === featuredTiles.length - 1 ? 0 : current + 1
    );
  };

  // Helper function to safely format price

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render just the active tile instead of all tiles
  const activeTile = featuredTiles[activeTileIndex];

  return (
    <div className="home-container">
      {/* Hero Section with Featured Tile Carousel */}
      <section className="relative bg-blue-800 text-white">
        <div className="relative h-[600px]">
          {featuredTiles.length > 0 ? (
            <div className="h-full">
              {/* Just render the active tile */}
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              {activeTile.primary_image ? (
                <img 
                  src={formatImageUrl(activeTile.primary_image)}
                  alt={activeTile.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/1200x600?text=Premium+Tiles";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-blue-700 flex items-center justify-center">
                  <span className="text-2xl">No image available</span>
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{activeTile.title}</h1>
                  <p className="text-xl mb-8 max-w-2xl">
                    {activeTile.description || 'Premium tile solutions for your space'}
                  </p>
                  <div className="flex space-x-4">
                    <Link 
                      to={`/tiles/${activeTile.id}`}
                      className="bg-white text-blue-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                    >
                      View Details
                    </Link>
                    <Link 
                      to="/contact" 
                      className="border border-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-800 transition"
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Carousel Controls */}
              {featuredTiles.length > 1 && (
                <>
                  <button 
                    onClick={prevTile}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white transition-colors"
                    aria-label="Previous"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button 
                    onClick={nextTile}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white transition-colors"
                    aria-label="Next"
                  >
                    <ArrowRight size={24} />
                  </button>
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                    {featuredTiles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTileIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === activeTileIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-800">
              <p className="text-2xl">No featured tiles available</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Type Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Product Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect tile solution for any area of your home or business
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productTypes.map((type) => (
              <Link 
                key={type.id}
                to={`/products/${type.slug}`}
                className="group bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  {type.image_url ? (
                    <img 
                      src={type.image_url}
                      alt={type.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x300?text=${type.name}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                      <span className="text-2xl">{type.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{type.name}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>Browse Collection</span>
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See our craftsmanship in action with these recent installations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <Link 
                  key={project.id} 
                  to={`/projects/${project.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    {project.primary_image ? (
                      <img 
                        src={formatImageUrl(project.primary_image)} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300?text=${project.title}`;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Location:</span> {project.location}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No featured projects available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              to="/projects"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              View All Projects
              <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Space?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Schedule a free consultation with our design experts and get started on your next tile project.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/contact"
              className="bg-white text-blue-800 px-8 py-4 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link 
              to="/about"
              className="border border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;