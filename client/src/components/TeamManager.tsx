// client/src/components/TeamManager.tsx
import { useState, useEffect } from 'react';
import { TeamMember } from '../types/types';
import { teamService } from '../services/teamService';
import { AlertCircle, Loader, Plus, X, Edit, Trash2, User, Phone, Mail, Eye } from 'lucide-react';

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    display_order: 0,
    active: true,
  });
  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching team members...');
      const data = await teamService.getTeamMembers();
      console.log('Team members fetched successfully:', data.length);
      setTeamMembers(data);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      let errorMessage = 'Failed to fetch team members. Please try again later.';
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewTeamMember({ ...newTeamMember, [name]: checked });
    } else if (type === 'number') {
      setNewTeamMember({ ...newTeamMember, [name]: parseInt(value) });
    } else {
      setNewTeamMember({ ...newTeamMember, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTeamImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
          setShowImagePreview(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamImage && !editingMember) {
      setError('Please select a team member image');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add team member data
      Object.entries(newTeamMember).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add image if available
      if (teamImage) {
        formData.append('image', teamImage);
      }
      
      if (editingMember) {
        await teamService.updateTeamMember(editingMember.id, formData);
      } else {
        await teamService.createTeamMember(formData);
      }
      
      fetchTeamMembers();
      resetForm();
    } catch (err: any) {
      console.error('Error saving team member:', err);
      let errorMessage = 'Failed to save team member. Please try again later.';
      
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
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        setLoading(true);
        setError(null);
        await teamService.deleteTeamMember(id);
        await fetchTeamMembers();
      } catch (err: any) {
        console.error('Error deleting team member:', err);
        let errorMessage = 'Failed to delete team member. Please try again later.';
        
        if (err.message && err.message.includes('401')) {
          errorMessage = 'Authentication error. Please try logging in again.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setNewTeamMember({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      email: member.email || '',
      phone: member.phone || '',
      display_order: member.display_order,
      active: member.active,
    });
    
    // Set image preview if available
    if (member.image_url) {
      setImagePreview(member.image_url);
      setShowImagePreview(true);
    } else {
      setShowImagePreview(false);
    }
    
    setShowAddForm(true);
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      setLoading(true);
      setError(null);
      
      await teamService.toggleTeamMemberActive(member.id, !member.active);
      await fetchTeamMembers();
    } catch (err: any) {
      console.error('Error toggling team member status:', err);
      let errorMessage = 'Failed to update team member status. Please try again later.';
      
      if (err.message && err.message.includes('401')) {
        errorMessage = 'Authentication error. Please try logging in again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingMember(null);
    setNewTeamMember({
      name: '',
      position: '',
      bio: '',
      email: '',
      phone: '',
      display_order: teamMembers.length + 1,
      active: true,
    });
    setTeamImage(null);
    setImagePreview('');
    setShowImagePreview(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Team</h2>
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
              Add Team Member
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
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newTeamMember.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="position" className="block text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={newTeamMember.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email (optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newTeamMember.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">Phone (optional)</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={newTeamMember.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="display_order" className="block text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={newTeamMember.display_order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={newTeamMember.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-gray-700">
                  Active Member
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-gray-700 mb-2">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={newTeamMember.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-gray-700 mb-2">
                  {editingMember ? 'Team Member Image (Leave empty to keep current)' : 'Team Member Image'}
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingMember}
                />
              </div>
              
              {showImagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-300">
                    <img 
                      src={imagePreview} 
                      alt="Team member preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
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
                'Save Team Member'
              )}
            </button>
          </div>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="flex justify-center items-center p-12">
          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading team members...</span>
        </div>
      ) : (
        <div className="mt-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No team members found. Add some!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden ${!member.active ? 'opacity-60' : ''}`}
                >
                  <div className="h-48 overflow-hidden relative">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                    
                    {/* Activity status badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                    
                    <div className="space-y-2 mb-4">
                      {member.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={16} className="mr-2 text-gray-400" />
                          <span>{member.email}</span>
                        </div>
                      )}
                      
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={16} className="mr-2 text-gray-400" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Order: {member.display_order}</span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`p-1 rounded-full ${member.active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                          title={member.active ? 'Set as Inactive' : 'Set as Active'}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(member)} 
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)} 
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
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

export default TeamManager;