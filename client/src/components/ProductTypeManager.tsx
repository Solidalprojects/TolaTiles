// client/src/components/ProductTypeManager.tsx
import { useState, useEffect } from 'react';
import { ProductType } from '../types/types';
import { productTypeService } from '../services/productTypeService';
import { useProductTypes } from '../context/ProductCategoriesContext';
import { 
  AlertCircle, Loader, Plus, X, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, 
  LayoutGrid,
  // Import common Lucide icons that might be used for product types
  Grid, Box, Droplet, Flame, Home, BookOpen, Dribbble, Coffee, Compass,
  Diamond, Award, Briefcase, Leaf, Layers, Palette, PaintBucket, Star, Zap,
  SquarePen, FlowerIcon, Shapes,
} from 'lucide-react';
import { getStoredAuth } from '../services/auth';

// Define available icons for product types
const AVAILABLE_ICONS = [
  { name: 'Grid', component: Grid },
  { name: 'Box', component: Box },
  { name: 'Droplet', component: Droplet },
  { name: 'Flame', component: Flame },
  { name: 'Home', component: Home },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Dribbble', component: Dribbble },
  { name: 'Coffee', component: Coffee },
  { name: 'Compass', component: Compass },
  { name: 'Diamond', component: Diamond },
  { name: 'Award', component: Award },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Leaf', component: Leaf },
  { name: 'Layers', component: Layers },
  { name: 'Palette', component: Palette },
  { name: 'PaintBucket', component: PaintBucket },
  { name: 'Star', component: Star },
  { name: 'Zap', component: Zap },
  { name: 'SquarePattern', component: SquarePen },
  { name: 'FlowerIcon', component: FlowerIcon },
  { name: 'Shapes', component: Shapes },
];

// Icon Picker Component
const IconPicker = ({ 
  selectedIcon, 
  onSelectIcon 
}: { 
  selectedIcon: string, 
  onSelectIcon: (iconName: string) => void 
}) => {
  return (
    <div className="border border-gray-300 rounded-md p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Select Navbar Icon</h4>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
        {AVAILABLE_ICONS.map((icon) => {
          const IconComponent = icon.component;
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => onSelectIcon(icon.name)}
              className={`p-2 border rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center ${
                selectedIcon === icon.name ? 'bg-blue-100 border-blue-500' : 'border-gray-200'
              }`}
              title={icon.name}
            >
              <IconComponent size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper to render icon by name
const renderIconByName = (iconName: string, size = 24) => {
  const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
  if (!icon) return <Box size={size} />;
  
  const IconComponent = icon.component;
  return <IconComponent size={size} />;
};

const ProductTypeManager = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newProductType, setNewProductType] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    active: true,
    show_in_navbar: true,
    icon_name: 'Grid', // Default icon
  });
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Get the refresh function from context
  const { refreshProductTypes } = useProductTypes();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      // Check auth status for debugging
      const { token } = getStoredAuth();
      setAuthStatus(token ? `Token found (${token.substring(0, 5)}...)` : 'No token found');
      
      // Proceed to fetch product types
      await fetchProductTypes();
    } catch (err) {
      console.error('Error during initial data fetch:', err);
      setError('Could not initialize data. Please check your connection and authentication status.');
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching product types...');
      const data = await productTypeService.getProductTypes();
      console.log('Product types fetched successfully:', data.length);
      
      // Sort by display_order
      const sortedData = [...data].sort((a, b) => a.display_order - b.display_order);
      setProductTypes(sortedData);
    } catch (err: any) {
      console.error('Error fetching product types:', err);
      let errorMessage = 'Failed to fetch product types. Please try again later.';
      
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
      setNewProductType({ ...newProductType, [name]: checked });
    } else {
      setNewProductType({ ...newProductType, [name]: value });
      
      // Auto-generate slug from name
      if (name === 'name' && !editingProductType) {
        const slug = value
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')  // Remove special chars
          .replace(/\s+/g, '-')      // Replace spaces with hyphens
          .trim();
        
        setNewProductType(prev => ({ ...prev, slug }));
      }
    }
  };

  const handleIconSelect = (iconName: string) => {
    setNewProductType(prev => ({ ...prev, icon_name: iconName }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(newProductType).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add image if available
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      if (editingProductType) {
        await productTypeService.updateProductType(editingProductType.id, formData);
      } else {
        await productTypeService.createProductType(formData);
      }
      
      // Refresh data
      await fetchProductTypes();
      
      // Also refresh the product types context to ensure nav menus are updated
      await refreshProductTypes();
      
      resetForm();
    } catch (err: any) {
      console.error('Error saving product type:', err);
      let errorMessage = 'Failed to save product type. Please try again later.';
      
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
    if (window.confirm('Are you sure you want to delete this product type? This may affect categories and tiles.')) {
      try {
        setLoading(true);
        setError(null);
        await productTypeService.deleteProductType(id);
        
        // Refresh data
        await fetchProductTypes();
        await refreshProductTypes();
      } catch (err: any) {
        console.error('Error deleting product type:', err);
        let errorMessage = 'Failed to delete product type. Please try again later.';
        
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

  const handleEdit = (productType: ProductType) => {
    setEditingProductType(productType);
    setNewProductType({
      name: productType.name,
      slug: productType.slug,
      description: productType.description || '',
      display_order: productType.display_order,
      active: productType.active,
      show_in_navbar: productType.show_in_navbar || true,
      icon_name: productType.icon_name || 'Grid', // Use existing icon or default to Grid
    });
    
    // Set image preview if available
    if (productType.image_url) {
      setImagePreview(productType.image_url);
    } else {
      setImagePreview(null);
    }
    
    setShowAddForm(true);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // Toggle active status
      await productTypeService.updateProductType(id, { active: !currentActive });
      
      // Refresh data
      await fetchProductTypes();
      await refreshProductTypes();
    } catch (err: any) {
      console.error('Error toggling active status:', err);
      setError('Failed to update product type status.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNavbar = async (id: number, currentShowInNavbar: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // Toggle navbar visibility
      await productTypeService.updateProductType(id, { show_in_navbar: !currentShowInNavbar });
      
      // Refresh data
      await fetchProductTypes();
      await refreshProductTypes();
    } catch (err: any) {
      console.error('Error toggling navbar visibility:', err);
      setError('Failed to update product type navbar visibility.');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveOrder = async (id: number, direction: 'up' | 'down') => {
    try {
      const currentIndex = productTypes.findIndex(pt => pt.id === id);
      if (currentIndex === -1) return;
      
      // Can't move first item up or last item down
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === productTypes.length - 1)
      ) {
        return;
      }
      
      const currentItem = productTypes[currentIndex];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetItem = productTypes[targetIndex];
      
      // Swap display orders
      const currentOrder = currentItem.display_order;
      const targetOrder = targetItem.display_order;
      
      setLoading(true);
      setError(null);
      
      // Update both items
      await Promise.all([
        productTypeService.updateProductType(currentItem.id, { display_order: targetOrder }),
        productTypeService.updateProductType(targetItem.id, { display_order: currentOrder })
      ]);
      
      // Refresh data
      await fetchProductTypes();
      await refreshProductTypes();
    } catch (err: any) {
      console.error('Error changing display order:', err);
      setError('Failed to update display order.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingProductType(null);
    setNewProductType({
      name: '',
      slug: '',
      description: '',
      display_order: productTypes.length + 1,
      active: true,
      show_in_navbar: true,
      icon_name: 'Grid',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Product Types</h2>
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
              Add New Product Type
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
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingProductType ? 'Edit Product Type' : 'Add New Product Type'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProductType.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={newProductType.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={editingProductType !== null}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly identifier. Auto-generated from name, but you can customize it.
                  {editingProductType && " Can't be changed when editing."}
                </p>
              </div>
              
              <div>
                <label htmlFor="display_order" className="block text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={newProductType.display_order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first in menus and listings
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={newProductType.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-gray-700">
                  Active
                </label>
                <p className="text-xs text-gray-500 ml-2">
                  Inactive product types won't show up in menus
                </p>
              </div>
              
              {/* Navbar Visibility Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_in_navbar"
                  name="show_in_navbar"
                  checked={newProductType.show_in_navbar}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_in_navbar" className="ml-2 block text-gray-700">
                  Show in Navbar
                </label>
                <p className="text-xs text-gray-500 ml-2">
                  Display this product type in the main navigation menu
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProductType.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              {/* Icon Picker */}
              <div>
                <label className="block text-gray-700 mb-2">Navbar Icon</label>
                <IconPicker
                  selectedIcon={newProductType.icon_name}
                  onSelectIcon={handleIconSelect}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This icon will be displayed in the navigation menu
                </p>
              </div>
              
              <div>
                <label htmlFor="image" className="block text-gray-700 mb-2">
                  {editingProductType ? 'Cover Image (Leave empty to keep current)' : 'Cover Image'}
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This image will be used on product category pages and cards
                </p>
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cover Image Preview:</p>
                  <div className="w-full h-32 border border-gray-300 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Icon Preview */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Selected Icon Preview:</p>
                <div className="w-full h-24 border border-gray-300 rounded-md overflow-hidden bg-white flex justify-center items-center">
                  <div className="flex flex-col items-center">
                    {renderIconByName(newProductType.icon_name, 32)}
                    <span className="text-sm text-gray-500 mt-2">{newProductType.icon_name}</span>
                  </div>
                </div>
              </div>
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
                'Save Product Type'
              )}
            </button>
          </div>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="flex justify-center items-center p-12">
          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading product types...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {productTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No product types found. Add some!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navbar
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiles
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productTypes.map((productType, index) => (
                  <tr key={productType.id} className={!productType.active ? 'bg-gray-50' : undefined}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-900">{productType.display_order}</span>
                        <div className="ml-2 flex flex-col">
                          <button 
                            onClick={() => handleMoveOrder(productType.id, 'up')}
                            disabled={index === 0}
                            className={`text-gray-400 hover:text-gray-700 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button 
                            onClick={() => handleMoveOrder(productType.id, 'down')}
                            disabled={index === productTypes.length - 1}
                            className={`text-gray-400 hover:text-gray-700 ${index === productTypes.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {renderIconByName(productType.icon_name || 'Grid', 20)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {productType.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {productType.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {productType.description || 
                          <span className="italic text-gray-400">No description</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        productType.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {productType.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleNavbar(productType.id, productType.show_in_navbar || false)}
                        className={`p-1 rounded ${
                          productType.show_in_navbar 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        title={productType.show_in_navbar ? 'Shown in navbar' : 'Hidden from navbar'}
                      >
                        <LayoutGrid size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {productType.tiles_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleActive(productType.id, productType.active)}
                          className={`p-1 rounded ${
                            productType.active 
                              ? 'text-green-600 hover:text-green-900' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={productType.active ? 'Deactivate' : 'Activate'}
                        >
                          {productType.active ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(productType)}
                          className="p-1 text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(productType.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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

export default ProductTypeManager;