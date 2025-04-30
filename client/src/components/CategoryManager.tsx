// client/src/components/CategoryManager.tsx
// Fixed to handle proper type conversion for product_type

import { useState, useEffect } from 'react';
import { Category, ProductType } from '../types/types';
import { categoryService } from '../services/api';
import { productTypeService } from '../services/productTypeService';
import { AlertCircle, Loader, Plus, X, Edit, Trash2 } from 'lucide-react';
import { getStoredAuth } from '../services/auth';

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    product_type: '', // This will hold the ID as a string, but we'll convert it before sending
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  // New filter state for filtering categories by product type in the display
  const [filterProductType, setFilterProductType] = useState<string>('');

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      // Check auth status for debugging
      const { token } = getStoredAuth();
      setAuthStatus(token ? `Token found (${token.substring(0, 5)}...)` : 'No token found');
      
      // Fetch product types first
      await fetchProductTypes();
      
      // Then fetch categories
      await fetchCategories();
    } catch (err) {
      console.error('Error during initial data fetch:', err);
      setError('Could not initialize data. Please check your connection and authentication status.');
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      console.log('Fetching product types...');
      const data = await productTypeService.getProductTypes();
      console.log('Product types fetched successfully:', data.length);
      setProductTypes(data);
    } catch (err) {
      console.error('Error fetching product types:', err);
      setError('Failed to fetch product types. Please try again later.');
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching categories...');
      const data = await categoryService.getCategories();
      console.log('Categories fetched successfully:', data.length);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      let errorMessage = 'Failed to fetch categories. Please try again later.';
      
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
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure product_type is valid
      if (!newCategory.product_type) {
        setError('Please select a product type for this category');
        setLoading(false);
        return;
      }
      
      // Create a new object with proper types for the API
      const categoryData: Partial<Category> = {
        name: newCategory.name,
        description: newCategory.description
      };
      
      // Convert product_type to number if it's not empty
      if (newCategory.product_type) {
        categoryData.product_type = parseInt(newCategory.product_type);
      }
      
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      
      fetchCategories();
      resetForm();
    } catch (err: any) {
      console.error('Error saving category:', err);
      let errorMessage = 'Failed to save category. Please try again later.';
      
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
    if (window.confirm('Are you sure you want to delete this category? All associated tiles will also be deleted.')) {
      try {
        setLoading(true);
        setError(null);
        await categoryService.deleteCategory(id);
        await fetchCategories();
      } catch (err: any) {
        console.error('Error deleting category:', err);
        let errorMessage = 'Failed to delete category. Please try again later.';
        
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
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      product_type: category.product_type ? category.product_type.toString() : '',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      description: '',
      product_type: '',
    });
  };

  // Get filtered categories based on selected product type filter
  const getFilteredCategories = () => {
    if (!filterProductType) {
      return categories;
    }
    return categories.filter(category => 
      category.product_type && category.product_type.toString() === filterProductType
    );
  };

  // Get product type name by ID
  const getProductTypeName = (productTypeId?: number | null) => {
    if (!productTypeId) return 'None';
    const productType = productTypes.find(pt => pt.id === productTypeId);
    return productType ? productType.name : 'Unknown';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
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
              Add New Category
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

      {/* Debug info - only visible during development */}
      {process.env.NODE_ENV === 'development' && authStatus && (
        <div className="mb-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
          Auth status: {authStatus}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          
          {/* Product Type Selection */}
          <div className="mb-4">
            <label htmlFor="product_type" className="block text-gray-700 mb-2">Product Type *</label>
            <select
              id="product_type"
              name="product_type"
              value={newCategory.product_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Product Type</option>
              {productTypes.map((productType) => (
                <option key={productType.id} value={productType.id.toString()}>
                  {productType.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              The product type this category belongs to
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Name *</label>
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
          <div className="mb-4">
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Category'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter by Product Type */}
      {!showAddForm && (
        <div className="mb-6">
          <label htmlFor="filterProductType" className="block text-gray-700 mb-2">Filter by Product Type</label>
          <div className="flex space-x-2">
            <select
              id="filterProductType"
              value={filterProductType}
              onChange={(e) => setFilterProductType(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Product Types</option>
              {productTypes.map((productType) => (
                <option key={productType.id} value={productType.id.toString()}>
                  {productType.name}
                </option>
              ))}
            </select>
            {filterProductType && (
              <button
                onClick={() => setFilterProductType('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {loading && !showAddForm ? (
        <div className="flex justify-center items-center p-12">
          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading categories...</span>
        </div>
      ) : (
        <div className="mt-6">
          {getFilteredCategories().length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {filterProductType 
                  ? 'No categories found for this product type. Add some!' 
                  : 'No categories found. Add some!'}
              </p>
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
                      Product Type
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiles
                    </th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getFilteredCategories().map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {getProductTypeName(category.product_type)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {category.description || <span className="text-gray-400 italic">No description</span>}
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {category.images_count || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(category)} 
                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)} 
                            className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} className="mr-1" />
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