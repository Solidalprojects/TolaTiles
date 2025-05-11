// Updated src/pages/ProjectDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Project, Tile } from '../types/types';
import { projectService, tileService } from '../services/api';
import { formatImageUrl } from '../utils/imageUtils';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, Calendar, MapPin, 
  User, CheckSquare, ChevronDown, ChevronUp, Info, AlertCircle
} from 'lucide-react';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id, slug } = useParams<{ id?: string, slug?: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [tilesUsed, setTilesUsed] = useState<Tile[]>([]);
  const [showDescription, setShowDescription] = useState<boolean>(true);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    console.log("ProjectDetail component mounted with params:", { id, slug });
    fetchProjectData();
  }, [id, slug]); // Re-fetch when the route parameters change

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let projectData;
      console.log("Fetching project with id or slug:", id || slug);
      
      // Fetch project either by ID or slug
      if (id && !isNaN(parseInt(id))) {
        console.log("Fetching project by ID:", id);
        projectData = await projectService.getProjectById(parseInt(id));
      } else if (slug) {
        console.log("Fetching project by slug:", slug);
        // Fallback to fetching all projects and filtering by slug
        const allProjects = await projectService.getProjects();
        projectData = allProjects.find(p => p.slug === slug) || null;
        
        if (!projectData) {
          throw new Error(`Project with slug "${slug}" not found`);
        }
      } else {
        throw new Error('No ID or slug provided');
      }
      
      console.log("Project data fetched:", projectData);
      setProject(projectData);
      
      // Fetch tiles used in this project if available
      if (projectData.tiles_used && projectData.tiles_used.length > 0) {
        setTilesUsed(projectData.tiles_used);
      } else {
        // If tiles_used is not populated, try to fetch some sample tiles
        try {
          const sampleTiles = await tileService.getTiles({ featured: true });
          setTilesUsed(sampleTiles.slice(0, 4)); // Just use a few sample tiles
        } catch (err) {
          console.error("Error fetching sample tiles:", err);
          // Non-critical error, we can continue without tiles
        }
      }
      
      // Fetch related projects (for example, projects in the same location)
      try {
        const allProjects = await projectService.getProjects();
        const filtered = allProjects
          .filter(p => p.id !== projectData.id && p.location === projectData.location)
          .slice(0, 3);
        
        if (filtered.length === 0) {
          // If no projects with the same location, just get some other projects
          const otherProjects = allProjects
            .filter(p => p.id !== projectData.id)
            .slice(0, 3);
          setRelatedProjects(otherProjects);
        } else {
          setRelatedProjects(filtered);
        }
      } catch (err) {
        console.error("Error fetching related projects:", err);
        // Non-critical error, we can continue without related projects
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrevImage = () => {
    if (!project || !project.images || project.images.length === 0) return;
    
    setActiveImageIndex(prevIndex => 
      prevIndex === 0 ? project.images!.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    if (!project || !project.images || project.images.length === 0) return;
    
    setActiveImageIndex(prevIndex => 
      prevIndex === project.images!.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Format date to a readable string
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Project
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Project not found'}</p>
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
  const images = project.images && project.images.length > 0 
    ? project.images 
    : (project.primary_image 
        ? [{ id: 0, image_url: project.primary_image, is_primary: true, created_at: '', image: '', caption: project.title }] 
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
                <Link to="/projects" className="text-gray-500 hover:text-gray-700">Projects</Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                <span className="text-gray-900 font-medium">{project.title}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
          {project.featured && (
            <div className="mb-4">
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                Featured Project
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-gray-700">
                <span className="font-medium">Client:</span> {project.client || 'N/A'}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-gray-700">
                <span className="font-medium">Location:</span> {project.location || 'N/A'}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-gray-700">
                <span className="font-medium">Completed:</span> {formatDate(project.completed_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:flex md:space-x-8 mb-12">
          {/* Image Gallery Section - Takes 60% width on desktop */}
          <div className="md:w-3/5 mb-8 md:mb-0">
            {/* Main Image with Navigation */}
            <div className="relative rounded-lg overflow-hidden bg-gray-200" style={{ height: '500px' }}>
              {images.length > 0 ? (
                <img 
                  src={formatImageUrl(images[activeImageIndex].image_url)} 
                  alt={images[activeImageIndex].caption || project.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/800x500?text=Project+Image";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
              
              {/* Caption for the current image */}
              {images[activeImageIndex]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                  <p className="text-sm">{images[activeImageIndex].caption}</p>
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
                    key={typeof image.id === 'number' ? image.id : index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative rounded-md overflow-hidden h-20 ${
                      index === activeImageIndex ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                    }`}
                    title={image.caption || `Image ${index + 1}`}
                  >
                    <img 
                      src={formatImageUrl(image.image_url)} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/100x100?text=Thumbnail";
                      }}
                    />
                    {image.is_primary && (
                      <div className="absolute top-0 right-0 bg-yellow-400 p-1 rounded-bl-md">
                        <CheckSquare className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Project Details Section - Takes 40% width on desktop */}
          <div className="md:w-2/5">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Description Section with Toggle */}
              <div className="mb-6">
                <button 
                  className="flex items-center justify-between w-full text-left font-semibold text-gray-900"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  <span>Project Description</span>
                  {showDescription ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {showDescription && (
                  <div className="mt-4 text-gray-700">
                    <p className="whitespace-pre-line">{project.description || 'No description available for this project.'}</p>
                  </div>
                )}
              </div>
              
              {/* Additional Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="space-y-3">
                  {project.area_size && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-1/3">Area Size:</span>
                      <span className="text-gray-600">{project.area_size}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">Status:</span>
                    <span className="text-gray-600">{project.status_display || 'Completed'}</span>
                  </div>
                  {project.testimonial && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                      <p className="text-gray-700 italic">"{project.testimonial}"</p>
                      <p className="text-gray-500 mt-2 text-sm">— {project.client}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested in a Similar Project?</h3>
                <Link 
                  to="/contact" 
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  Contact Us for a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tiles Used in Project */}
        {tilesUsed.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiles Used in This Project</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tilesUsed.map(tile => (
                <Link 
                  key={tile.id} 
                  to={`/tiles/${tile.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    {tile.primary_image ? (
                      <img 
                        src={formatImageUrl(tile.primary_image)} 
                        alt={tile.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300?text=${tile.title.charAt(0)}`;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{tile.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {tile.size && <span className="mr-2">{tile.size}</span>}
                      {tile.material && <span>{tile.material}</span>}
                    </p>
                    {tile.price && (
                      <p className="font-medium text-gray-900">${typeof tile.price === 'number' ? tile.price.toFixed(2) : tile.price}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map(relatedProject => (
                <Link 
                  key={relatedProject.id} 
                  to={`/projects/${relatedProject.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    {relatedProject.primary_image ? (
                      <img 
                        src={formatImageUrl(relatedProject.primary_image)} 
                        alt={relatedProject.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300?text=${relatedProject.title.charAt(0)}`;
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{relatedProject.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Location:</span> {relatedProject.location}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {relatedProject.description || 'No description available'}
                    </p>
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

export default ProjectDetail;