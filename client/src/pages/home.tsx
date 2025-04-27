import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Tile, Category, Project } from '../types/types';

const Home = () => {
  const [featuredTiles, setFeaturedTiles] = useState<Tile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'http://localhost:8000/api/';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured tiles
        const tilesResponse = await axios.get(`${API_URL}tiles/?featured=true`);
        setFeaturedTiles(tilesResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}categories/`);
        setCategories(categoriesResponse.data);
        
        // Fetch featured projects
        const projectsResponse = await axios.get(`${API_URL}projects/?featured=true`);
        setFeaturedProjects(projectsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              {/* Placeholder for hero image - replace with actual image */}
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
              <p>Loading featured tiles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredTiles.length > 0 ? (
                featuredTiles.map((tile) => (
                  <div key={tile.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={`http://localhost:8000${tile.images}`} 
                      alt={tile.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{tile.title}</h3>
                      <p className="text-gray-600 mb-4">{tile.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {categories.find(c => c.id === tile.category)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No featured tiles found.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Tile Categories</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <p>Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <Link to={`/categories/${category.id}`} className="text-blue-600 font-medium hover:text-blue-800">
                        View Tiles →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No categories found.</p>
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
              <p>Loading featured projects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                    {project.images && project.images.length > 0 ? (
                      <img 
                        src={`http://localhost:8000${project.images[0].image}`} 
                        alt={project.title}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold mb-2">{project.title}</h3>
                      <div className="mb-4">
                        <p className="text-gray-600"><strong>Client:</strong> {project.client}</p>
                        <p className="text-gray-600"><strong>Location:</strong> {project.location}</p>
                        <p className="text-gray-600"><strong>Completed:</strong> {new Date(project.completed_date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {project.description.length > 150
                          ? `${project.description.substring(0, 150)}...`
                          : project.description}
                      </p>
                      <Link to={`/projects/${project.id}`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition">
                        View Project Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No featured projects found.</p>
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