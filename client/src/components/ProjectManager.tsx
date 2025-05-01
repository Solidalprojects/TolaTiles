// client/src/components/ProjectManager.tsx
// client/src/components/ProjectManager.tsx
import { useState, useEffect } from 'react';
import { Project } from '../types/types';
import { projectService } from '../services/api';
import { AlertCircle, Loader, Plus, X, Edit, Trash2, Camera } from 'lucide-react';

const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client: '',
    location: '',
    completed_date: '',
    featured: false,
  });
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [imageCaptions, setImageCaptions] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching projects...');
      const data = await projectService.getProjects();
      console.log('Projects fetched successfully:', data);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewProject({ ...newProject, [name]: checked });
    } else {
      setNewProject({ ...newProject, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setProjectImages(fileArray);
      
      // Initialize captions array with empty strings
      setImageCaptions(fileArray.map(() => ''));
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const newCaptions = [...imageCaptions];
    newCaptions[index] = caption;
    setImageCaptions(newCaptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Append project data
      Object.entries(newProject).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      
      // Upload images directly with the project
      if (projectImages.length > 0) {
        // Add images to the project formData
        projectImages.forEach((file, index) => {
          formData.append('images', file);
          
          // Add captions if available
          if (imageCaptions[index]) {
            formData.append(`caption_${index}`, imageCaptions[index]);
          }
        });
        
        // Set primary image index
        formData.append('primary_image', '0'); // Set first image as primary by default
      }
      
      if (editingProject) {
        // Update existing project
      } else {
        // Create new project with images in a single request
      }
      
      await fetchProjects();
      resetForm();
    } catch (err: any) {
      console.error('Error saving project:', err);
      let errorMessage = 'Failed to save project. Please try again later.';
      
      // Enhanced error handling
      if (err.message) {
        if (err.message.includes('401')) {
          errorMessage = 'Authentication error. Please try logging in again.';
        } else if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        setError(null);
        await projectService.deleteProject(id);
        await fetchProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      title: project.title,
      description: project.description,
      client: project.client,
      location: project.location,
      completed_date: project.completed_date,
      featured: project.featured,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingProject(null);
    setNewProject({
      title: '',
      description: '',
      client: '',
      location: '',
      completed_date: '',
      featured: false,
    });
    setProjectImages([]);
    setImageCaptions([]);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Projects</h2>
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
              Add New Project
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
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newProject.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="client" className="block text-gray-700 mb-2">Client</label>
            <input
              type="text"
              id="client"
              name="client"
              value={newProject.client}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 mb-2">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={newProject.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="completed_date" className="block text-gray-700 mb-2">Completion Date</label>
            <input
              type="date"
              id="completed_date"
              name="completed_date"
              value={newProject.completed_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={newProject.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="ml-2 block text-gray-700">
              Featured Project
            </label>
          </div>
          
          {!editingProject && (
            <div className="mb-4">
              <label htmlFor="images" className="block text-gray-700 mb-2">Project Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {projectImages.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <h4 className="font-medium mb-2">Image Captions</h4>
                  <p className="text-sm text-gray-500 mb-3">The first image will be set as the primary image.</p>
                  {projectImages.map((file, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <span className="mr-2 text-sm truncate" style={{ maxWidth: '200px' }}>{file.name}</span>
                      <input
                        type="text"
                        placeholder="Enter caption"
                        value={imageCaptions[index] || ''}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
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
                'Save Project'
              )}
            </button>
          </div>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="flex justify-center items-center p-12">
          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading projects...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No projects found. Add some!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-48 overflow-hidden relative">
                  {project.primary_image ? (
                    <img 
                      src={project.primary_image}
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <Camera size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <div className="mb-3 text-sm">
                    <p><span className="font-medium text-gray-700">Client:</span> {project.client}</p>
                    <p><span className="font-medium text-gray-700">Location:</span> {project.location}</p>
                    <p><span className="font-medium text-gray-700">Completed:</span> {formatDate(project.completed_date)}</p>
                    <p>
                      <span className="font-medium text-gray-700">Status:</span>
                      {project.featured ? (
                        <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">Featured</span>
                      ) : (
                        <span className="ml-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">Standard</span>
                      )}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(project)} 
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)} 
                      className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
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

export default ProjectManager;