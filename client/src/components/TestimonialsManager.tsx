// client/src/components/TestimonialManager.tsx
import React, { useState, useEffect } from 'react';
import { CustomerTestimonial, Project } from '../types/types';
import { testimonialService } from '../services/testimonialService';
import { projectService } from '../services/api';
import { 
  AlertCircle, Loader, Plus, X, Edit, Trash2, 
  Star, Check, Upload, User} from 'lucide-react';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTestimonial, setNewTestimonial] = useState({
    customer_name: '',
    location: '',
    testimonial: '',
    rating: 5,
    approved: false,
    project: '',
  });
  const [testimonialImage, setTestimonialImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<CustomerTestimonial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterApproved, setFilterApproved] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch testimonials
      const testimonialData = await testimonialService.getTestimonials();
      setTestimonials(testimonialData);
      
      // Fetch projects for dropdown
      const projectData = await projectService.getProjects();
      setProjects(projectData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewTestimonial({ ...newTestimonial, [name]: checked });
    } else if (name === 'rating') {
      setNewTestimonial({ ...newTestimonial, [name]: parseInt(value) });
    } else {
      setNewTestimonial({ ...newTestimonial, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTestimonialImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add testimonial data
      Object.entries(newTestimonial).forEach(([key, value]) => {
        if (value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Add image if available
      if (testimonialImage) {
        formData.append('image', testimonialImage);
      }
      
      let result;
      if (editingTestimonial) {
        result = await testimonialService.updateTestimonial(editingTestimonial.id, formData);
      } else {
        result = await testimonialService.createTestimonial(formData);
      }
      
      console.log('Testimonial saved:', result);
      await fetchData();
      resetForm();
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      setError('Failed to save testimonial. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        setLoading(true);
        setError(null);
        await testimonialService.deleteTestimonial(id);
        console.log(`Testimonial ${id} deleted successfully`);
        await fetchData();
      } catch (err: any) {
        console.error('Error deleting testimonial:', err);
        setError('Failed to delete testimonial. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (testimonial: CustomerTestimonial) => {
    setEditingTestimonial(testimonial);
    setNewTestimonial({
      customer_name: testimonial.customer_name,
      location: testimonial.location || '',
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      approved: testimonial.approved,
      project: testimonial.project ? testimonial.project.toString() : '',
    });
    
    // Reset image state
    setTestimonialImage(null);
    setImagePreview(testimonial.image_url || null);
    
    setShowAddForm(true);
  };

  const toggleApproval = async (testimonial: CustomerTestimonial) => {
    try {
      setLoading(true);
      setError(null);
      await testimonialService.toggleApproval(testimonial.id);
      console.log(`Testimonial ${testimonial.id} approval toggled`);
      await fetchData();
    } catch (err: any) {
      console.error('Error toggling approval:', err);
      setError('Failed to update testimonial approval status.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingTestimonial(null);
    setNewTestimonial({
      customer_name: '',
      location: '',
      testimonial: '',
      rating: 5,
      approved: false,
      project: '',
    });
    setTestimonialImage(null);
    setImagePreview(null);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (filterApproved === 'all') return true;
    if (filterApproved === 'approved') return testimonial.approved;
    if (filterApproved === 'pending') return !testimonial.approved;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Testimonials</h2>
        <button 
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? (
            <>
              <X size={18} className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus size={18} className="mr-2" />
              Add New Testimonial
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <AlertCircle size={18} className="mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="customer_name" className="block text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={newTestimonial.customer_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newTestimonial.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Dallas, TX"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="testimonial" className="block text-gray-700 mb-1">Testimonial *</label>
            <textarea
              id="testimonial"
              name="testimonial"
              value={newTestimonial.testimonial}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="project" className="block text-gray-700 mb-1">Related Project</label>
              <select
                id="project"
                name="project"
                value={newTestimonial.project}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rating" className="block text-gray-700 mb-1">Rating *</label>
              <select
                id="rating"
                name="rating"
                value={newTestimonial.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Customer Image</label>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </div>
              </div>
              
              {imagePreview && (
                <div className="w-24 h-24 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTestimonialImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="approved"
              name="approved"
              checked={newTestimonial.approved}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="approved" className="ml-2 block text-gray-700">
              Approved for Display
            </label>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Testimonial'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter controls */}
      {!showAddForm && (
        <div className="mb-6 flex items-center space-x-4">
          <label htmlFor="filterApproved" className="text-gray-700">Filter by status:</label>
          <select
            id="filterApproved"
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Testimonials</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Approval</option>
          </select>
          
          <div className="ml-auto text-gray-600 text-sm">
            Showing {filteredTestimonials.length} of {testimonials.length} testimonials
          </div>
        </div>
      )}

      {/* Testimonials List */}
      {loading && !showAddForm ? (
        <div className="flex justify-center items-center p-12">
          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading testimonials...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{
                filterApproved === 'approved' ? 'No approved testimonials found.' :
                filterApproved === 'pending' ? 'No pending testimonials found.' :
                'No testimonials found. Add some!'
              }</p>
            </div>
          ) : (
            filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className={`bg-white rounded-lg shadow-sm p-6 ${testimonial.approved ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
                <div className="flex items-start">
                  {/* Customer image or avatar */}
                  <div className="mr-4">
                    {testimonial.image_url ? (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.customer_name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold border-2 border-gray-200">
                        {testimonial.customer_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Testimonial content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{testimonial.customer_name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          {testimonial.location && (
                            <span className="mr-3">{testimonial.location}</span>
                          )}
                          <span>{formatDate(testimonial.date)}</span>
                        </div>
                        <div className="mb-2">
                          {renderStarRating(testimonial.rating)}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleApproval(testimonial)} 
                          className={`p-1 rounded-md ${
                            testimonial.approved 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}
                          title={testimonial.approved ? 'Unapprove' : 'Approve'}
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(testimonial)} 
                          className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(testimonial.id)} 
                          className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mt-2">"{testimonial.testimonial}"</p>
                    
                    {testimonial.project_title && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Related project:</span> <span className="font-medium">{testimonial.project_title}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        testimonial.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {testimonial.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;