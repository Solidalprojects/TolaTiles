// client/src/pages/About.tsx
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { TeamMember, CustomerTestimonial } from '../types/types';
import { teamService } from '../services/teamService';
import { testimonialService } from '../services/testimonialService';
import { 
  Users, MessageSquare, Mail, Phone, ChevronRight, 
  Star, ArrowLeft, ArrowRight
} from 'lucide-react';
import tolalogo from '../assets/abouttola.jpg'

const About = () => {
  // State for team members and testimonials
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  
  // State for testimonial carousel
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const testimonialsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update carousel positioning when active index changes
    if (testimonialsRef.current && testimonials.length > 0) {
      testimonialsRef.current.style.transform = `translateX(-${activeTestimonialIndex * 100}%)`;
    }
  }, [activeTestimonialIndex, testimonials]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch team members
      try {
        const teamData = await teamService.getTeamMembers({ active: true });
        setTeamMembers(teamData);
      } catch (error) {
        console.error('Error fetching team members:', error);
        // Fall back to mock data if service isn't implemented
      }
      
      // Fetch testimonials - only approved ones
      try {
        const testimonialsData = await testimonialService.getApprovedTestimonials();
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Fall back to mock data if service isn't implemented
     
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Testimonial carousel navigation functions
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

  // Render a single testimonial with image
  const renderTestimonial = (testimonial: CustomerTestimonial) => (
    <div 
      key={testimonial.id} 
      className="w-full px-4"
      style={{ width: `${100 / testimonials.length}%` }}
    >
      <div className="bg-white rounded-lg p-8 md:p-10 shadow-lg">
        <div className="flex justify-center mb-6">
          {renderStarRating(testimonial.rating)}
        </div>
        
        {/* Add testimonial image if available */}
        {testimonial.image_url && (
          <div className="flex justify-center mb-6">
            <img 
              src={testimonial.image_url} 
              alt={`${testimonial.customer_name}`} 
              className="w-24 h-24 object-cover rounded-full border-4 border-blue-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/96?text=${testimonial.customer_name.charAt(0)}`;
              }}
            />
          </div>
        )}
        
        {/* If no image, show initial */}
        {!testimonial.image_url && (
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold border-4 border-blue-50">
              {testimonial.customer_name.charAt(0)}
            </div>
          </div>
        )}
        
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
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* About Us Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">About Tola Tiles</h1>
              <p className="text-lg text-gray-700 mb-6">
                Since 2010, Tola Tiles has been providing premium tile solutions for residential and commercial projects. 
                We pride ourselves on quality craftsmanship, exceptional customer service, and attention to detail.
              </p>
              <p className="text-lg text-gray-700 mb-8">
                Our team of experts will help you select the perfect tiles for your space and ensure 
                a flawless installation. Whether you're renovating your kitchen, bathroom, or outdoor area, 
                we have the expertise to make your vision a reality.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Expert Team</h3>
                    <p className="mt-1 text-gray-500">Highly skilled professionals with years of experience in the industry.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MessageSquare size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Customer Satisfaction</h3>
                    <p className="mt-1 text-gray-500">Our clients' happiness is our top priority, with hundreds of successfully completed projects.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Mail size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Free Consultation</h3>
                    <p className="mt-1 text-gray-500">Schedule a free consultation with our design experts to get started.</p>
                  </div>
                </div>
              </div>
              <Link 
                to="/contact" 
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Contact Us
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={tolalogo} 
                  alt="Tola Tiles Office" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated professionals are committed to delivering exceptional tile solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="h-64 overflow-hidden">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x400?text=${member.name.charAt(0)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 mb-4">{member.position}</p>
                    <p className="text-gray-600">{member.bio}</p>
                    
                    {(member.email || member.phone) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {member.email && (
                          <div className="flex items-center text-gray-600 mb-2">
                            <Mail size={16} className="mr-2" />
                            <a href={`mailto:${member.email}`} className="hover:text-blue-600 transition-colors">
                              {member.email}
                            </a>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone size={16} className="mr-2" />
                            <a href={`tel:${member.phone}`} className="hover:text-blue-600 transition-colors">
                              {member.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Our team information is coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our satisfied customers about their experience with Tola Tiles
            </p>
          </div>
          
          {testimonials.length > 0 ? (
            <div className="relative overflow-hidden">
              <div 
                ref={testimonialsRef}
                className="flex transition-transform duration-700 ease-in-out"
                style={{ width: `${testimonials.length * 100}%` }}
              >
                {testimonials.map(testimonial => renderTestimonial(testimonial))}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Client testimonials are coming soon.</p>
            </div>
          )}
          
          {/* Add Testimonial CTA */}
          <div className="mt-12 text-center">
            <Link 
              to="/contact" 
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Share Your Experience
              <ChevronRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <p className="text-blue-200">Years in Business</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-blue-200">Projects Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <p className="text-blue-200">5-Star Reviews</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-blue-200">Product Varieties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Space?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Schedule a free consultation with our design experts and get started on your next tile project.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/contact"
              className="bg-blue-600 text-white px-8 py-4 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link 
              to="/projects"
              className="border border-blue-600 text-blue-600 px-8 py-4 rounded-md font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Browse Our Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;