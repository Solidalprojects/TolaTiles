// client/src/pages/Projects.tsx
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Project, ProductType } from '../types/types';
import { projectService } from '../services/api';
import { productTypeService } from '../services/productTypeService';
import { formatImageUrl } from '../utils/imageUtils';
import { 
  Search, X, Calendar, MapPin, 
  User, ChevronRight, SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

const Projects = () => {
  // State for projects and filters
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Unique locations for filter dropdown
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter states change
    applyFilters();
  }, [searchTerm, selectedProductType, selectedLocation, showFeaturedOnly, projects]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all projects
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
      
      // Extract unique locations for filtering
      const uniqueLocations = Array.from(new Set(projectsData.map(project => project.location)))
        .filter(location => location) // Remove any undefined/null values
        .sort();
      setLocations(uniqueLocations);
      
      // Fetch product types for filtering
      try {
        const productTypesData = await productTypeService.getProductTypes();
        setProductTypes(productTypesData);
      } catch (error) {
        console.error('Error fetching product types:', error);
        // Mock data if service fails
        setProductTypes([
          { id: 1, name: 'Tiles', slug: 'tiles', description: '', image_url: '', active: true, display_order: 1, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 2, name: 'Backsplashes', slug: 'backsplashes', description: '', image_url: '', active: true, display_order: 2, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 3, name: 'Fireplaces', slug: 'fireplaces', description: '', image_url: '', active: true, display_order: 3, created_at: '', updated_at: '', tiles_count: 0 },
          { id: 4, name: 'Flooring', slug: 'flooring', description: '', image_url: '', active: true, display_order: 4, created_at: '', updated_at: '', tiles_count: 0 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(project => 
        project.title.toLowerCase().includes(lowercasedSearch) ||
        project.description.toLowerCase().includes(lowercasedSearch) ||
        project.client.toLowerCase().includes(lowercasedSearch) ||
        project.location.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply product type filter
    if (selectedProductType) {
      results = results.filter(project => 
        project.product_type?.toString() === selectedProductType ||
        project.product_type_name?.toLowerCase() === selectedProductType.toLowerCase()
      );
    }
    
    // Apply location filter
    if (selectedLocation) {
      results = results.filter(project => 
        project.location === selectedLocation
      );
    }
    
    // Apply featured filter
    if (showFeaturedOnly) {
      results = results.filter(project => project.featured);
    }
    
    setFilteredProjects(results);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProductType('');
    setSelectedLocation('');
    setShowFeaturedOnly(false);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our portfolio of completed tile installations and get inspired for your next project
          </p>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Search Box */}
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <input
                type="text"
                placeholder="Search projects..."
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
            
            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center bg-white px-4 py-2 border border-gray-300 rounded-md"
            >
              <SlidersHorizontal size={18} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {/* Desktop Filter Controls */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Product Type Filter */}
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Product Types</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id.toString()}>
                    {type.name}
                  </option>
                ))}
              </select>
              
              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              
              {/* Featured Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">Featured Only</span>
              </label>
              
              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Mobile Filters (Collapsible) */}
          {showFilters && (
            <div className="md:hidden mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
              <div className="space-y-4">
                {/* Product Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={selectedProductType}
                    onChange={(e) => setSelectedProductType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Product Types</option>
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id.toString()}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Featured Toggle */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={() => setShowFeaturedOnly(!showFeaturedOnly)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">Featured Projects Only</span>
                  </label>
                </div>
                
                {/* Reset Button */}
                <button
                  onClick={resetFilters}
                  className="w-full py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Count & Sorting */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
          </p>
          
          {/* We could add sorting options here */}
        </div>
        
        {/* Projects Grid */}
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
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No projects found matching your criteria.</p>
            {(searchTerm || selectedProductType || selectedLocation || showFeaturedOnly) && (
              <button
                onClick={resetFilters}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Link 
                key={project.id} 
                to={`/projects/${project.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-56 overflow-hidden bg-gray-200 relative">
                  {project.primary_image ? (
                    <img 
                      src={formatImageUrl(project.primary_image)} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/600x400?text=${project.title.charAt(0)}`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                  
                  {/* Featured badge */}
                  {project.featured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-semibold">
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 mb-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <User size={16} className="mr-1" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-1" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar size={16} className="mr-1" />
                      <span>{formatDate(project.completed_date)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    {project.product_type_name && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {project.product_type_name}
                      </span>
                    )}
                    
                    <span className="text-blue-600 flex items-center">
                      View Details
                      <ChevronRight size={16} className="ml-1" />
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
              <h2 className="text-2xl font-bold mb-4">Want a Similar Project for Your Space?</h2>
              <p className="mb-6">
                Our team of experts can help you transform your home or business with premium tile solutions.
                Contact us today for a free consultation.
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

export default Projects;