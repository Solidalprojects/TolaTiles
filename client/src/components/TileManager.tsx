// client/src/components/TileManager.tsx - Fixed category filtering based on product type
import { useState, useEffect } from 'react';
import { Tile, Category, ProductType } from '../types/types';
import { tileService, categoryService } from '../services/api';
import { productTypeService } from '../services/productTypeService';
import { 
  AlertCircle, Loader, Plus, X, Edit, Trash2, 
  Star, Image as ImageIcon, Search, Filter, Camera
} from 'lucide-react';

const TileManager = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTile, setNewTile] = useState({
    title: '',
    description: '',
    category: '',
    product_type: '',
    featured: false,
    price: '',
    size: '',
    material: '',
    in_stock: true,
  });
  
  // State for multiple images
  const [tileImages, setTileImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  
  const [editingTile, setEditingTile] = useState<Tile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterProductType, setFilterProductType] = useState<string>('');
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter categories when product type changes
    if (newTile.product_type) {
      const filtered = categories.filter(
        category => category.product_type?.toString() === newTile.product_type
      );
      setFilteredCategories(filtered);
      
      // If current selected category doesn't belong to the selected product type, reset it
      if (newTile.category && !filtered.some(c => c.id.toString() === newTile.category)) {
        setNewTile(prev => ({ ...prev, category: '' }));
      }
    } else {
      // If no product type is selected, show all categories
      setFilteredCategories(categories);
    }
  }, [newTile.product_type, categories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product types first
      try {
        const productTypesData = await productTypeService.getProductTypes();
        setProductTypes(productTypesData);
        console.log('Product types fetched:', productTypesData.length);
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
      
      // Fetch categories
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
      setFilteredCategories(categoriesData); // Initially show all categories
      
      // Fetch tiles with or without filters
      const filters = buildFilters();
      const tilesData = await tileService.getTiles(filters);
      setTiles(tilesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const buildFilters = () => {
    const filters: any = {};
    if (filterCategory) filters.category = filterCategory;
    if (filterProductType) filters.product_type = filterProductType;
    if (filterFeatured !== null) filters.featured = filterFeatured;
    if (searchTerm) filters.search = searchTerm;
    return filters;
  };

  const handleSearch = () => {
    fetchData();
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterProductType('');
    setFilterFeatured(null);
    setSearchTerm('');
    fetchData();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewTile({ ...newTile, [name]: checked });
    } else if (type === 'number') {
      setNewTile({ ...newTile, [name]: value });
    } else {
      setNewTile({ ...newTile, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setTileImages(fileArray);
      
      // Generate previews
      const newPreviews: string[] = [];
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === fileArray.length) {
            setImagePreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Set first image as primary by default
      setPrimaryImageIndex(0);
    }
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add tile data
      Object.entries(newTile).forEach(([key, value]) => {
        if (value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Add images
      tileImages.forEach((file) => {
        formData.append('images', file);
      });
      
      // Add primary image index
      if (tileImages.length > 0) {
        formData.append('primary_image', primaryImageIndex.toString());
      }
      
      if (editingTile) {
        await tileService.updateTile(editingTile.id, formData);
      } else {
        await tileService.createTile(formData);
      }
      
      fetchData();
      resetForm();
    } catch (err) {
      console.error('Error saving tile:', err);
      setError('Failed to save tile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tile?')) {
      try {
        setLoading(true);
        setError(null);
        await tileService.deleteTile(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting tile:', err);
        setError('Failed to delete tile. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (tile: Tile) => {
    setEditingTile(tile);
    setNewTile({
      title: tile.title,
      description: tile.description || '',
      category: tile.category.toString(),
      product_type: tile.product_type ? tile.product_type.toString() : '',
      featured: tile.featured,
      price: tile.price?.toString() || '',
      size: tile.size || '',
      material: tile.material || '',
      in_stock: tile.in_stock,
    });
    setShowAddForm(true);
    
    // Reset image selection when editing
    setTileImages([]);
    setImagePreviews([]);
    setPrimaryImageIndex(0);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingTile(null);
    setNewTile({
      title: '',
      description: '',
      category: '',
      product_type: '',
      featured: false,
      price: '',
      size: '',
      material: '',
      in_stock: true,
    });
    setTileImages([]);
    setImagePreviews([]);
    setPrimaryImageIndex(0);
  };

  // Format price to currency

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Tiles</h2>
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
              Add New Tile
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

      {!showAddForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="searchTerm" className="block text-gray-700 mb-1 text-sm">Search</label>
              <div className="relative">
                <input
                  type="text"
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tiles..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="filterProductType" className="block text-gray-700 mb-1 text-sm">Product Type</label>
              <select
                id="filterProductType"
                value={filterProductType}
                onChange={(e) => setFilterProductType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Product Types</option>
                {productTypes.map((productType) => (
                  <option key={productType.id} value={productType.id}>
                    {productType.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterCategory" className="block text-gray-700 mb-1 text-sm">Category</label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories
                  .filter(category => !filterProductType || category.product_type?.toString() === filterProductType)
                  .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterFeatured" className="block text-gray-700 mb-1 text-sm">Featured Status</label>
              <select
                id="filterFeatured"
                value={filterFeatured === null ? '' : filterFeatured.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterFeatured(value === '' ? null : value === 'true');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tiles</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Filter size={18} className="mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingTile ? 'Edit Tile' : 'Add New Tile'}</h3>
          
          {/* Basic Information */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTile.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Product Type field */}
              <div>
                <label htmlFor="product_type" className="block text-gray-700 mb-1">Product Type</label>
                <select
                  id="product_type"
                  name="product_type"
                  value={newTile.product_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map((productType) => (
                    <option key={productType.id} value={productType.id}>
                      {productType.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={newTile.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {newTile.product_type && filteredCategories.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    No categories found for this product type. Please create a category first.
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="description" className="block text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={newTile.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          
          {/* Specifications */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  value={newTile.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label htmlFor="size" className="block text-gray-700 mb-1">Size</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={newTile.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 12x12, 24x48"
                />
              </div>
              <div>
                <label htmlFor="material" className="block text-gray-700 mb-1">Material</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  value={newTile.material}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Porcelain, Ceramic"
                />
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="in_stock"
                name="in_stock"
                checked={newTile.in_stock}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="in_stock" className="ml-2 block text-gray-700">
                In Stock
              </label>
            </div>
            
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={newTile.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured" className="ml-2 block text-gray-700">
                Featured Tile
              </label>
            </div>
          </div>
          
          {/* Images */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Images</h4>
            
            <div className="mt-2">
              <label htmlFor="images" className="block text-gray-700 mb-1">
                {editingTile ? 'Add New Images (Leave empty to keep current images)' : 'Upload Images'}
              </label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingTile}
              />
              <p className="mt-1 text-sm text-gray-500">
                You can select multiple images. The first image will be set as the primary image by default.
              </p>
            </div>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2 text-gray-700">Preview & Select Primary Image</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={`relative rounded-md overflow-hidden border-2 ${index === primaryImageIndex ? 'border-blue-500' : 'border-gray-200'}`}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className={`absolute bottom-2 right-2 p-1 rounded-full ${
                          index === primaryImageIndex 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={index === primaryImageIndex ? 'Primary Image' : 'Set as Primary'}
                      >
                        <Star size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Existing Images (when editing) */}
            {editingTile && editingTile.images && editingTile.images.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2 text-gray-700">Current Images</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {editingTile.images.map((image, index) => (
                    <div key={image.id} className={`relative rounded-md overflow-hidden border-2 ${image.is_primary ? 'border-blue-500' : 'border-gray-200'}`}>
                      <img
                        src={image.image_url}
                        alt={image.caption || `Image ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {image.is_primary && (
                        <div className="absolute bottom-2 right-2 p-1 rounded-full bg-blue-500 text-white">
                          <Star size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  These images will be kept. Upload new images above if you want to add more.
                </p>
              </div>
            )}
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
                'Save Tile'
              )}
            </button>
          </div>
        </form>
      )}

      {loading && !showAddForm ? (
        <div className="flex justify-center items-center p-12">
          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading tiles...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tiles.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No tiles found. Add some!</p>
            </div>
          ) : (
            tiles.map((tile) => (
              <div key={tile.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden relative">
                  {tile.primary_image ? (
                    <img 
                      src={tile.primary_image} 
                      alt={tile.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <Camera size={32} className="text-gray-400" />
                    </div>
                  )}
                  {tile.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 p-1 rounded-full">
                      <Star size={16} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{tile.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tile.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {categories.find(c => c.id === tile.category)?.name || 'Uncategorized'}
                      </span>
                      {/* Show Product Type */}
                      {tile.product_type && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {productTypes.find(pt => pt.id === tile.product_type)?.name || 'No Type'}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEdit(tile)} 
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(tile.id)} 
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
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

export default TileManager;