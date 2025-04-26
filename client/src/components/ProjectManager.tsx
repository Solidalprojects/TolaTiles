// client/src/components/ProjectManager.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { authHeader } from '../services/auth';
import { Project, ProjectImage } from '../types/types';

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

  const API_URL = 'http://localhost:8000/api/';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}projects/`, { headers: authHeader() });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      
      let projectId: number;
      
      if (editingProject) {
        // Update existing project
        const response = await axios.patch(
          `${API_URL}projects/${editingProject.id}/`, 
          newProject, 
          { headers: authHeader() }
        );
        projectId = response.data.id;
      } else {
        // Create new project
        const response = await axios.post(
          `${API_URL}projects/`, 
          newProject, 
          { headers: authHeader() }
        );
        projectId = response.data.id;
      }
      
      // Upload images if any
      if (projectImages.length > 0) {
        for (let i = 0; i < projectImages.length; i++) {
          const formData = new FormData();
          formData.append('project', projectId.toString());
          formData.append('image', projectImages[i]);
          formData.append('caption', imageCaptions[i] || '');
          
          await axios.post(`${API_URL}project-images/`, formData, {
            headers: {
              ...authHeader(),
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }
      
      fetchProjects();
      setShowAddForm(false);
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
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}projects/${id}/`, { headers: authHeader() });
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="project-manager">
      <div className="manager-header">
        <h2>Manage Projects</h2>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
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
          }}
        >
          {showAddForm ? 'Cancel' : 'Add New Project'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="project-form">
          <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newProject.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="client">Client</label>
            <input
              type="text"
              id="client"
              name="client"
              value={newProject.client}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={newProject.location}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="completed_date">Completion Date</label>
            <input
              type="date"
              id="completed_date"
              name="completed_date"
              value={newProject.completed_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={newProject.featured}
              onChange={handleInputChange}
            />
            <label htmlFor="featured">Featured</label>
          </div>
          
          {!editingProject && (
            <div className="form-group">
              <label htmlFor="images">Project Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
                multiple
              />
              
              {projectImages.length > 0 && (
                <div className="image-captions">
                  <h4>Image Captions</h4>
                  {projectImages.map((file, index) => (
                    <div key={index} className="caption-input">
                      <p>{file.name}</p>
                      <input
                        type="text"
                        placeholder="Image caption"
                        value={imageCaptions[index]}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Project'}
          </button>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="loading">Loading projects...</div>
      ) : (
        <div className="projects-list">
          {projects.length === 0 ? (
            <p>No projects found. Add some!</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <h3>{project.title}</h3>
                  <p><strong>Client:</strong> {project.client}</p>
                  <p><strong>Location:</strong> {project.location}</p>
                  <p><strong>Completed:</strong> {formatDate(project.completed_date)}</p>
                  <p><strong>Status:</strong> {project.featured ? 'Featured' : 'Not Featured'}</p>
                  <div className="project-description">
                    <p>{project.description}</p>
                  </div>
                  
                  {project.images && project.images.length > 0 && (
                    <div className="project-images">
                      <h4>Project Images</h4>
                      <div className="image-thumbnails">
                        {project.images.map((image, index) => (
                          <div key={index} className="image-thumbnail">
                            <img src={`http://localhost:8000${image.image}`} alt={image.caption || `Project image ${index + 1}`} />
                            {image.caption && <p>{image.caption}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="project-actions">
                    <button onClick={() => handleEdit(project)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManager;