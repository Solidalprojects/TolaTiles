// client/src/components/DashboardNavbar.tsx
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import logo from '../assets/solidalnavlogo.svg';

const DashboardNavbar = () => {
  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img 
                src={logo} 
                alt="Solidal" 
                className="h-10 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/120x40?text=Solidal";
                }}
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="https://solidal.onrender.com"
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowLeft size={18} className="mr-1" />
              Go Back
            </Link>
            <Link
              to="/"
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <Home size={18} className="mr-1" />
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;