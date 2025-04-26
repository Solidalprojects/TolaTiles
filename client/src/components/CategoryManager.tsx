// client/src/components/CategoryManager.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { authHeader } from '../services/auth';

interface Category {
  id: number;
  name: string;
  description: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const API_URL = 'http://localhost:8000/api/';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}categories/`, { headers: authHeader() });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingCategory) {
        await axios.patch(`${API_URL}categories/${editingCategory.id}/`, newCategory, {
          headers: authHeader()
        });
      } else {
        await axios.post(`${API_URL}categories/`, newCategory, {
          headers: authHeader()
        });
      }
      
      fetchCategories();
      setShowAddForm(false);
      setNewCategory({
        name: '',
        description: '',
      });
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? All associated tiles will also be deleted.')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}categories/${id}/`, { headers: authHeader() });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
    });
    setShowAddForm(true);
  };

  return (
    <div className="category-manager">
      <div className="manager-header">
        <h2>Manage Categories</h2>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingCategory(null);
            setNewCategory({
              name: '',
              description: '',
            });
          }}
        >
          {showAddForm ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCategory.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="categories-list">
          {categories.length === 0 ? (
            <p>No categories found. Add some!</p>
          ) : (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td className="category-actions">
                      <button onClick={() => handleEdit(category)} className="edit-button">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;