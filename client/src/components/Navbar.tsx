// Updated Navbar.tsx with corrected login path
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from '../services/auth';
import logo from '../assets/tolatiles.jpg';
import { 
  Menu, X, LogOut, User, ChevronDown, Home, Grid, Briefcase, 
  Settings, Phone, Info, 
  // Import all Lucide icons that might be used for product types
  Flame, Droplet, Box, BookOpen, Dribbble, Coffee, Compass,
  Diamond, Award, Leaf, Layers, Palette, PaintBucket, Star, Zap,
  SquarePen, FlowerIcon, Shapes, LayoutGrid
} from 'lucide-react';
import { useProductTypes, sortedProductTypes } from '../context/ProductCategoriesContext';

// Helper to render icon by name - Fixed TypeScript type for iconName
const getIconByName = (iconName: string | undefined, size = 18) => {
  // Default to Grid if no icon_name is provided
  if (!iconName) return <Grid size={size} />;
  
  // Map icon_name to Lucide React component
  switch (iconName) {
    case 'Grid': return <Grid size={size} />;
    case 'Box': return <Box size={size} />;
    case 'Droplet': return <Droplet size={size} />;
    case 'Flame': return <Flame size={size} />;
    case 'Home': return <Home size={size} />;
    case 'BookOpen': return <BookOpen size={size} />;
    case 'Dribbble': return <Dribbble size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Compass': return <Compass size={size} />;
    case 'Diamond': return <Diamond size={size} />;
    case 'Award': return <Award size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Leaf': return <Leaf size={size} />;
    case 'Layers': return <Layers size={size} />;
    case 'Palette': return <Palette size={size} />;
    case 'PaintBucket': return <PaintBucket size={size} />;
    case 'Star': return <Star size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'SquarePattern': return <SquarePen size={size} />;
    case 'FlowerIcon': return <FlowerIcon size={size} />;
    case 'Shapes': return <Shapes size={size} />;
    case 'LayoutGrid': return <LayoutGrid size={size} />;
    default: return <Grid size={size} />; // Default fallback
  }
};

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get product types from context
  const { productTypes, loading } = useProductTypes();
  
  // Get sorted and filtered product types for navbar
  // Add null check to handle possible undefined productTypes
  const navbarProductTypes = productTypes ? 
    sortedProductTypes(productTypes).filter(type => type.active && type.show_in_navbar) :
    [];

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      const userData = getCurrentUser();
      setUsername(userData?.user?.username || 'User');
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setIsProfileMenuOpen(false);
    navigate('/auth/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close other menus when mobile menu is toggled
    setIsProductsMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    // Close products menu when profile menu is toggled
    setIsProductsMenuOpen(false);
  };

  const toggleProductsMenu = () => {
    setIsProductsMenuOpen(!isProductsMenuOpen);
    // Close profile menu when products menu is toggled
    setIsProfileMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProductsMenuOpen || isProfileMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setIsProductsMenuOpen(false);
          setIsProfileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductsMenuOpen, isProfileMenuOpen]);

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and brand name */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logo} 
              alt="Tola Tiles" 
              className="h-10 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/40x40?text=TT";
              }}
            />
            <span className="text-white font-bold text-lg">Tola Tiles</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors flex items-center">
              <Home size={18} className="mr-1" />
              <span>Home</span>
            </Link>
            
            {/* Products Dropdown Menu */}
            <div className="relative menu-container">
              <button
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors flex items-center"
                onClick={toggleProductsMenu}
              >
                <Grid size={18} className="mr-1" />
                <span>Products</span>
                <ChevronDown size={16} className={`ml-1 transform transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductsMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20">
                  {/* All Tiles option first */}
                  <Link
                    to="/products/tiles"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsProductsMenuOpen(false)}
                  >
                    <span className="mr-2 w-5 h-5 flex items-center justify-center">
                      <Grid size={18} />
                    </span>
                    All Tiles
                  </Link>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  {/* Dynamically generated product type links */}
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : (
                    navbarProductTypes
                      .filter(type => type.slug !== 'tiles') // Exclude "All Tiles" since we already have it
                      .map((type) => (
                        <Link
                          key={type.id}
                          to={`/products/${type.slug}`}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setIsProductsMenuOpen(false)}
                        >
                          <span className="mr-2 w-5 h-5 flex items-center justify-center">
                            {getIconByName(type.icon_name)}
                          </span>
                          {type.name}
                        </Link>
                      ))
                  )}
                </div>
              )}
            </div>
            
            <Link to="/projects" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors flex items-center">
              <Briefcase size={18} className="mr-1" />
              <span>Projects</span>
            </Link>
            
            <Link to="/about" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors flex items-center">
              <Info size={18} className="mr-1" />
              <span>About Us</span>
            </Link>
            
            <Link to="/contact" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors flex items-center">
              <Phone size={18} className="mr-1" />
              <span>Contact</span>
            </Link>
            
            {isLoggedIn ? (
              <div className="relative ml-3 menu-container">
                <div>
                  <button
                    type="button"
                    className="flex items-center text-white px-3 py-2 rounded-md hover:bg-blue-800 transition-colors focus:outline-none"
                    onClick={toggleProfileMenu}
                  >
                    <User size={18} className="mr-2" />
                    <span>{username}</span>
                    <ChevronDown size={16} className={`ml-1 transform transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link 
                      to="/auth/dashboard" 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors flex items-center">
                <User size={18} className="mr-2" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white hover:text-blue-200 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={18} className="mr-2" />
              Home
            </Link>
            
            {/* Products collapsible section */}
            <div>
              <button
                className="text-white hover:bg-blue-700 w-full text-left px-3 py-2 rounded-md flex items-center justify-between"
                onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
              >
                <span className="flex items-center">
                  <Grid size={18} className="mr-2" />
                  Products
                </span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {isProductsMenuOpen && (
                <div className="pl-6 mt-1 space-y-1 border-l border-blue-700 ml-4">
                  {/* All Tiles option first */}
                  <Link
                    to="/products/tiles"
                    className="text-blue-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-2 w-5 h-5 flex items-center justify-center">
                      <Grid size={18} />
                    </span>
                    All Tiles
                  </Link>
                  
                  {/* Dynamically generated product type links */}
                  {loading ? (
                    <div className="text-blue-200 px-3 py-2">Loading...</div>
                  ) : (
                    navbarProductTypes
                      .filter(type => type.slug !== 'tiles') // Exclude "All Tiles" since we already have it
                      .map((type) => (
                        <Link
                          key={type.id}
                          to={`/products/${type.slug}`}
                          className="text-blue-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md flex items-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="mr-2 w-5 h-5 flex items-center justify-center">
                            {getIconByName(type.icon_name)}
                          </span>
                          {type.name}
                        </Link>
                      ))
                  )}
                </div>
              )}
            </div>
            
            <Link 
              to="/projects" 
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Briefcase size={18} className="mr-2" />
              Projects
            </Link>
            
            <Link 
              to="/about" 
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Info size={18} className="mr-2" />
              About Us
            </Link>
            
            <Link 
              to="/contact" 
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Phone size={18} className="mr-2" />
              Contact
            </Link>
            
            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-blue-300 font-medium border-t border-blue-700 mt-2 pt-2">
                  Signed in as <span className="font-bold">{username}</span>
                </div>
                <Link 
                  to="/auth/dashboard" 
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} className="mr-2" />
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-white hover:bg-blue-700 w-full text-left px-3 py-2 rounded-md flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/auth/login" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} className="mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;