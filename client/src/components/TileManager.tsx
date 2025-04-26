// client/src/components/TileManager.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { authHeader } from '../services/auth';

interface Tile {
  id: number;
  title: string;
  description: string;
  image: string;
  category: number;
  featured: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

const TileManager = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTile, setNewTile] = useState({
    title: '',
    description: '',
    image: null as File | null,
    category: '',
    featured: false,
  });
  const [editingTile, setEditingTile] = useState<Tile | null>(null);

  const API_URL = 'http://localhost:8000/api/';

  useEffect(() => {
    fetchTiles();
    fetchCategories();
  }, []);

  const fetchTiles = async () => {
    try {
      const response = await axios.get(`${API_URL}tiles/`, { headers: authHeader() });
      setTiles(response.data);
    } catch (error) {
      console.error('Error fetching tiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}categories/`, { headers: authHeader() });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewTile({ ...newTile, [name]: checked });
    } else {
      setNewTile({ ...newTile, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTile({ ...newTile, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newTile.title);
    formData.append('description', newTile.description || '');
    formData.append('category', newTile.category);
    formData.append('featured', newTile.featured.toString());
    
    if (newTile.image) {
      formData.append('image', newTile.image);
    }
    
    try {
      setLoading(true);
      
      if (editingTile) {
        await axios.patch(`${API_URL}tiles/${editingTile.id}/`, formData, {
          headers: { 
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}tiles/`, formData, {
          headers: { 
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      fetchTiles();
      setShowAddForm(false);
      setNewTile({
        title: '',
        description: '',
        image: null,
        category: '',
        featured: false,
      });
      setEditingTile(null);
    } catch (error) {
      console.error('Error saving tile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tile?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}tiles/${id}/`, { headers: authHeader() });
        fetchTiles();
      } catch (error) {
        console.error('Error deleting tile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (tile: Tile) => {
    setEditingTile(tile);
    setNewTile({
      title: tile.title,
      description: tile.description,
      image: null,
      category: tile.category.toString(),
      featured: tile.featured,
    });
    setShowAddForm(true);
  };

  return (
    <div className="tile-manager">
      <div className="manager-header">
        <h2>Manage Tiles</h2>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingTile(null);
            setNewTile({
              title: '',
              description: '',
              image: null,
              category: '',
              featured: false,
            });
          }}
        >
          {showAddForm ? 'Cancel' : 'Add New Tile'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="tile-form">
          <h3>{editingTile ? 'Edit Tile' : 'Add New Tile'}</h3>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTile.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newTile.description || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={newTile.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              required={!editingTile}
            />
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={newTile.featured}
              onChange={handleInputChange}
            />
            <label htmlFor="featured">Featured</label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Tile'}
          </button>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="loading">Loading tiles...</div>
      ) : (
        <div className="tiles-grid">
          {tiles.length === 0 ? (
            <p>No tiles found. Add some!</p>
          ) : (
            tiles.map((tile) => (
              <div key={tile.id} className="tile-card">
                <img src={`http://localhost:8000${tile.image}`} alt={tile.title} />
                <h3>{tile.title}</h3>
                <p>{tile.description}</p>
                <div className="tile-meta">
                  <span>Category: {categories.find(c => c.id === tile.category)?.name}</span>
                  <span>{tile.featured ? 'Featured' : 'Not Featured'}</span>
                </div>
                <div className="tile-actions">
                  <button onClick={() => handleEdit(tile)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(tile.id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TileManager;

