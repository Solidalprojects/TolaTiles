// client/src/pages/home.tsx
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Tile, Category, Project } from '../types/types';
import { tileService, categoryService, projectService } from '../services/api';
import { formatImageUrl } from '../utils/imageUtils';

const Home = () => {
  const [featuredTiles, setFeaturedTiles] = useState<Tile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tiles (try getting all tiles first if featured doesn't work)
        let tilesData;
        try {
          // Try with featured filter first
          tilesData = await tileService.getTiles({ featured: true });
          console.log('Featured tiles loaded:', tilesData);
          
          // If no featured tiles found, fetch all tiles as a fallback
          if (!tilesData || tilesData.length === 0) {
            console.log('No featured tiles found, fetching all tiles');
            tilesData = await tileService.getTiles();
            // Just take the first 4 tiles for display
            tilesData = tilesData.slice(0, 4);
          }
        } catch (error) {
          console.error('Error fetching featured tiles, trying all tiles:', error);
          tilesData = await tileService.getTiles();
          // Just take the first 4 tiles for display
          tilesData = tilesData.slice(0, 4);
        }
        
        setFeaturedTiles(tilesData);
        
        // Fetch categories
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
        
        // Fetch featured projects
        let projectsData;
        try {
          projectsData = await projectService.getProjects({ featured: true });
          
          // If no featured projects, fetch all
          if (!projectsData || projectsData.length === 0) {
            projectsData = await projectService.getProjects();
            // Just take the first 2 projects for display
            projectsData = projectsData.slice(0, 2);
          }
        } catch (error) {
          console.error('Error fetching featured projects, trying all projects:', error);
          projectsData = await projectService.getProjects();
          // Just take the first 2 projects for display
          projectsData = projectsData.slice(0, 2);
        }
        
        setFeaturedProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  // Helper function to safely format price
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

  // Debug function to check tile data
  const debugTileData = (tile: Tile) => {
    console.log('Tile data:', {
      id: tile.id,
      title: tile.title,
      primaryImage: tile.primary_image,
      category: tile.category,
      price: tile.price,
      priceType: typeof tile.price,
      formattedImage: tile.primary_image ? formatImageUrl(tile.primary_image) : 'No image'
    });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-bold mb-4">Premium Tile Solutions for Your Space</h1>
              <p className="text-xl mb-8">
                Transform your home or business with our expert tile installation services and premium materials.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#featured-tiles" 
                  className="bg-white text-blue-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                >
                  View Our Tiles
                </a>
                <a 
                  href="#contact" 
                  className="border border-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              {/* Placeholder for hero image */}
              <div className="bg-blue-600 h-64 rounded-lg flex items-center justify-center">
                <p className="text-xl font-semibold">Beautiful Tile Installation Image</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tiles Section */}
      <section id="featured-tiles" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Tiles</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Debug info - will only show during development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-gray-100 text-xs">
                  <p>Total tiles: {featuredTiles.length}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredTiles.length > 0 ? (
                  featuredTiles.map((tile) => {
                    // For debugging
                    if (process.env.NODE_ENV === 'development') {
                      debugTileData(tile);
                    }
                    
                    return (
                      <Link 
                        key={tile.id} 
                        to={`/tiles/${tile.id}`} 
                        className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                      >
                        <div className="relative">
                          {tile.primary_image ? (
                            <img 
                              src={formatImageUrl(tile.primary_image)}
                              alt={tile.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image available</span>
                            </div>
                          )}
                          {tile.featured && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold mb-2">{tile.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{tile.description || "No description available"}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {categories.find(c => c.id === tile.category)?.name || 'Uncategorized'}
                            </span>
                            <span className="font-medium">
                              {formatPrice(tile.price)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="col-span-full text-center text-gray-500">No tiles found. Please add some from the admin dashboard.</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Tile Categories</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{category.description || 'No description available'}</p>
                      <Link to={`/categories/${category.slug || category.id}`} className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                        View Tiles 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No categories found. Please add some from the admin dashboard.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      {project.primary_image ? (
                        <img 
                          src={formatImageUrl(project.primary_image)}
                          alt={project.title}
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No image available</span>
                        </div>
                      )}
                      {project.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold mb-2">{project.title}</h3>
                      <div className="mb-4">
                        <p className="text-gray-600"><strong>Client:</strong> {project.client || 'N/A'}</p>
                        <p className="text-gray-600"><strong>Location:</strong> {project.location || 'N/A'}</p>
                        <p className="text-gray-600"><strong>Completed:</strong> {formatDate(project.completed_date)}</p>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {project.description || 'No description available'}
                      </p>
                      <div className="flex justify-end">
                        <span className="inline-flex items-center text-blue-600 font-medium">
                          View Project Details
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No featured projects found. Please add some from the admin dashboard.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Project?</h2>
              <p className="text-lg mb-6">
                Contact us today for a free consultation and quote. Our team of experts is ready to help you transform your space with beautiful tile work.
              </p>
              <div className="space-y-4">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  123 Construction Way, Tileville, TX 75001
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                  (555) 123-4567
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  info@tolatiles.com
                </p>
              </div>
            </div>
            <div className="lg:w-1/2">
              <form className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Your name"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Your email"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Tell us about your project"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;