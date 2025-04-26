// client/src/components/CategoryManager.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { authHeader } from '../services/auth';
import { Category } from '../types/types';

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:8000/api/';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Category[]>(`${API_URL}categories/`, { headers: authHeader() });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please try again later.');
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
      setError(null);
      
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
      resetForm();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? All associated tiles will also be deleted.')) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${API_URL}categories/${id}/`, { headers: authHeader() });
        await fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again later.');
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

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      description: '',
    });
  };

  return (
    <div className="category-manager p-6 bg-white rounded-lg shadow">
      <div className="manager-header">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        <button 
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="category-form bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="form-group">
            <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCategory.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="loading flex justify-center items-center p-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      ) : (
        <div className="categories-list mt-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No categories found. Add some!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {category.description || <span className="text-gray-400 italic">No description</span>}
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(category)} 
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)} 
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;