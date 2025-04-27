// pages/EnhancedHome.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { Tile, Category, Project, ProductType, CustomerTestimonial, TeamMember } from '../types/types';
import { tileService, categoryService, projectService } from '../services/api';
import { formatImageUrl } from '../utils/imageUtils';
import { ArrowLeft, ArrowRight, Star, ChevronRight, MessageSquare, Phone, Users, Calendar } from 'lucide-react';

// Import new services (you'll need to create these)
import { productTypeService } from '../services/productTypeService';
import { testimonialService } from '../services/testimonialService';
import { teamService } from '../services/teamService';

const Home = () => {
  // State for featured items
  const [featuredTiles, setFeaturedTiles] = useState<Tile[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for carousels
  const [activeTileIndex, setActiveTileIndex] = useState(0);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  
  // Refs for carousel handling
  const tilesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    
    // Set up interval for rotating featured tiles
    const interval = setInterval(() => {
      nextTile();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update carousel positioning when active indices change
    if (tilesRef.current && featuredTiles.length > 0) {
      tilesRef.current.style.transform = `translateX(-${activeTileIndex * 100}%)`;
    }
    
    if (projectsRef.current && featuredProjects.length > 0) {
      projectsRef.current.style.transform = `translateX(-${activeProjectIndex * 100}%)`;
    }
    
    if (testimonialsRef.current && testimonials.length > 0) {
      testimonialsRef.current.style.transform = `translateX(-${activeTestimonialIndex * 100}%)`;
    }
  }, [activeTileIndex, activeProjectIndex, activeTestimonialIndex, featuredTiles, featuredProjects, testimonials]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tiles with featured filter
      const tilesData = await tileService.getTiles({ featured: true });
      setFeaturedTiles(tilesData.length > 0 ? tilesData : await tileService.getTiles());
      
      // Fetch product types (you'll need to implement this service)
      try {
        const productTypesData = await productTypeService.getProductTypes();
        setProductTypes(productTypesData);
      } catch (error) {
        console.error('Error fetching product types, will use mock data:', error);
        // Mock data for product types if the service isn't implemented yet
        setProductTypes([
          { id: 1, name: 'Tiles', slug: 'tiles', description: 'Premium quality tiles for any surface', image_url: '/images/tiles.jpg' },
          { id: 2, name: 'Backsplashes', slug: 'backsplashes', description: 'Beautiful backsplashes for your kitchen', image_url: '/images/backsplash.jpg' },
          { id: 3, name: 'Fireplaces', slug: 'fireplaces', description: 'Elegant fireplace solutions', image_url: '/images/fireplace.jpg' },
          { id: 4, name: 'Flooring', slug: 'flooring', description: 'Durable and stylish flooring options', image_url: '/images/flooring.jpg' },
          { id: 5, name: 'Patios', slug: 'patios', description: 'Outdoor patio designs and materials', image_url: '/images/patio.jpg' },
          { id: 6, name: 'Showers', slug: 'showers', description: 'Modern shower tile solutions', image_url: '/images/shower.jpg' },
        ]);
      }
      
      // Fetch projects
      const projectsData = await projectService.getProjects({ featured: true });
      setFeaturedProjects(projectsData.length > 0 ? projectsData : await projectService.getProjects());
      
      // Fetch testimonials (you'll need to implement this service)
      try {
        const testimonialsData = await testimonialService.getTestimonials({ approved: true });
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error fetching testimonials, will use mock data:', error);
        // Mock data for testimonials if the service isn't implemented yet
        setTestimonials([
          { id: 1, customer_name: 'John Smith', testimonial: 'Tola Tiles transformed our kitchen with beautiful backsplash tiles. The quality and craftsmanship exceeded our expectations!', rating: 5, date: '2023-08-15', location: 'Dallas, TX' },
          { id: 2, customer_name: 'Sarah Johnson', testimonial: 'We love our new bathroom tile. The team was professional and the result is stunning.', rating: 5, date: '2023-07-22', location: 'Austin, TX' },
          { id: 3, customer_name: 'Michael Brown', testimonial: 'The fireplace renovation completely changed our living room. Excellent service from start to finish.', rating: 4, date: '2023-09-05', location: 'Houston, TX' },
        ]);
      }
      
      // Fetch team members (you'll need to implement this service)
      try {
        const teamData = await teamService.getTeamMembers();
        setTeamMembers(teamData);
      } catch (error) {
        console.error('Error fetching team members, will use mock data:', error);
        // Mock data for team members if the service isn't implemented yet
        setTeamMembers([
          { id: 1, name: 'Robert Johnson', position: 'Founder & CEO', bio: 'Over 20 years of experience in tile installation', image_url: '/images/team1.jpg' },
          { id: 2, name: 'Emma Williams', position: 'Design Consultant', bio: 'Helping customers find the perfect tiles for their space', image_url: '/images/team2.jpg' },
          { id: 3, name: 'David Martinez', position: 'Lead Installer', bio: 'Specialized in complex tile patterns and designs', image_url: '/images/team3.jpg' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Carousel navigation functions
  const prevTile = () => {
    setActiveTileIndex((current) => 
      current === 0 ? featuredTiles.length - 1 : current - 1
    );
  };

  const nextTile = () => {
    setActiveTileIndex((current) => 
      current === featuredTiles.length - 1 ? 0 : current + 1
    );
  };

  const prevProject = () => {
    setActiveProjectIndex((current) => 
      current === 0 ? featuredProjects.length - 1 : current - 1
    );
  };

  const nextProject = () => {
    setActiveProjectIndex((current) => 
      current === featuredProjects.length - 1 ? 0 : current + 1
    );
  };

  const prevTestimonial = () => {
    setActiveTestimonialIndex((current) => 
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const nextTestimonial = () => {
    setActiveTestimonialIndex((current) => 
      current === testimonials.length - 1 ? 0 : current + 1
    );
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

  // Helper to render star ratings
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
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
    <div className="home-container">
      {/* Hero Section with Featured Tile Carousel */}
      <section className="relative bg-blue-800 text-white overflow-hidden">
        <div className="relative h-[600px] overflow-hidden">
          <div 
            ref={tilesRef}
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ width: `${featuredTiles.length * 100}%` }}
          >
            {featuredTiles.map((tile, index) => (
              <div 
                key={tile.id} 
                className="relative w-full h-full"
                style={{ width: `${100 / featuredTiles.length}%` }}
              >
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                {tile.primary_image ? (
                  <img 
                    src={formatImageUrl(tile.primary_image)}
                    alt={tile.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-700 flex items-center justify-center">
                    <span className="text-2xl">No image available</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{tile.title}</h1>
                    <p className="text-xl mb-8 max-w-2xl">
                      {tile.description || 'Premium tile solutions for your space'}
                    </p>
                    <div className="flex space-x-4">
                      <Link 
                        to={`/tiles/${tile.id}`}
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
              </div>
            ))}
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

      {/* Featured Projects Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our recent work and get inspired for your next project
            </p>
          </div>
          
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div 
              ref={projectsRef}
              className="flex transition-transform duration-700 ease-in-out"
              style={{ width: `${featuredProjects.length * 100}%` }}
            >
              {featuredProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="relative w-full"
                  style={{ width: `${100 / featuredProjects.length}%` }}
                >
                  <div className="aspect-w-16 aspect-h-9 md:aspect-h-7">
                    {project.primary_image ? (
                      <img 
                        src={formatImageUrl(project.primary_image)}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{project.title}</h3>
                    <div className="flex flex-wrap gap-y-2 gap-x-6 mb-4">
                      <div className="flex items-center">
                        <Users size={18} className="mr-2 text-blue-300" />
                        <span>{project.client}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={18} className="mr-2 text-blue-300" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={18} className="mr-2 text-blue-300" />
                        <span>{formatDate(project.completed_date)}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-6 max-w-3xl line-clamp-2 md:line-clamp-3">
                      {project.description}
                    </p>
                    <Link 
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Project Details
                      <ChevronRight size={18} className="ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Controls */}
            {featuredProjects.length > 1 && (
              <>
                <button 
                  onClick={prevProject}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white transition-colors"
                  aria-label="Previous project"
                >
                  <ArrowLeft size={24} />
                </button>
                <button 
                  onClick={nextProject}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white transition-colors"
                  aria-label="Next project"
                >
                  <ArrowRight size={24} />
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                  {featuredProjects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveProjectIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === activeProjectIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`Go to project ${index + 1}`}
                    />
                  ))}
                </div>
              </>
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

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our satisfied customers about their experience with Tola Tiles
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <div 
              ref={testimonialsRef}
              className="flex transition-transform duration-700 ease-in-out"
              style={{ width: `${testimonials.length * 100}%` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full px-4"
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <div className="bg-gray-50 rounded-lg p-8 md:p-10 shadow-lg">
                    <div className="flex justify-center mb-6">
                      {renderStarRating(testimonial.rating)}
                    </div>
                    <blockquote className="text-xl text-center text-gray-800 italic mb-6">
                      "{testimonial.testimonial}"
                    </blockquote>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{testimonial.customer_name}</p>
                      {testimonial.location && (
                        <p className="text-gray-600">{testimonial.location}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">{formatDate(testimonial.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Controls */}
            {testimonials.length > 1 && (
              <>
                <button 
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-700 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft size={24} />
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ArrowRight size={24} />
                </button>
                
                {/* Dots indicator */}
                <div className="mt-8 flex justify-center space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonialIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === activeTestimonialIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Link 
              to="/testimonials"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Read More Testimonials
              <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg">
                {teamMembers.length > 0 && teamMembers[0].image_url ? (
                  <img 
                    src={teamMembers[0].image_url}
                    alt="Our Team"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-800 flex items-center justify-center text-white">
                    <span className="text-2xl">Tola Tiles Team</span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Tola Tiles</h2>
              <p className="text-gray-700 text-lg mb-6">
                Since 2010, Tola Tiles has been providing premium tile solutions for residential and commercial projects. 
                We pride ourselves on quality craftsmanship, exceptional customer service, and attention to detail.
              </p>
              <p className="text-gray-700 text-lg mb-8">
                Our team of experts will help you select the perfect tiles for your space and ensure 
                a flawless installation. Whether you're renovating your kitchen, bathroom, or outdoor area, 
                we have the expertise to make your vision a reality.
              </p>
              <div className="flex space-x-4">
                <Link 
                  to="/team"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Meet Our Team
                </Link>
                <Link 
                  to="/contact"
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
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
              to="/projects"
              className="border border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Browse Our Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;