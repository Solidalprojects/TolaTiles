import { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';
import logo from '../assets/react.svg';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const user = getCurrentUser();
    setIsLoggedIn(!!user);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="Tola Tiles" 
                className="h-10 w-auto"
              />
              <span className="text-white font-bold text-lg">Tola Tiles</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors">
              Home
            </Link>
            <Link to="/projects" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors">
              Projects
            </Link>
            <Link to="/categories" className="text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors">
              Categories
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link to="/auth/dashboard" className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth/login" className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/projects" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <Link 
              to="/categories" 
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/auth/dashboard" 
                  className="text-white bg-blue-600 hover:bg-blue-500 block px-3 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-white bg-red-600 hover:bg-red-500 w-full text-left px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/auth/login" 
                className="text-white bg-blue-600 hover:bg-blue-500 block px-3 py-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;