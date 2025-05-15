// client/src/components/Dashboard.tsx
// Updated Dashboard component with ProductTypeManager

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/auth';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import TileManager from './TileManager';
import CategoryManager from './CategoryManager';
import ProjectManager from './ProjectManager';
import TeamManager from './TeamManager';
import TestimonialsManager from './TestimonialsManager';
import ProductTypeManager from './ProductTypeManager';
import { ActiveTab } from '../types/types';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.TILES);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuthentication = () => {
      const authenticated = isAuthenticated();
      console.log("Dashboard auth check:", authenticated);
      
      if (!authenticated) {
        console.log("Dashboard - Not authenticated, redirecting to login");
        navigate('/auth/login', { replace: true });
        return;
      }
      
      const userData = getCurrentUser();
      console.log("Dashboard - User data:", userData?.user ? "Found" : "Not found");
      setUser(userData?.user || null);
      setLoading(false);
    };
    
    checkAuthentication();
    
    // Don't remove session auth when component mounts
    // Only set up event listeners for page unload/navigation
    const handleBeforeUnload = () => {
      // Clear session authentication when user leaves the page
      // sessionStorage.removeItem('sessionAuth');  // Comment this out to prevent auth loss on refresh
    };

    // Listen for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for navigation away from dashboard
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also comment this out to prevent auth loss when component unmounts
      // sessionStorage.removeItem('sessionAuth');
    };
  }, [navigate]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case ActiveTab.TILES:
        return <TileManager />;
      case ActiveTab.CATEGORIES:
        return <CategoryManager />;
      case ActiveTab.PROJECTS:
        return <ProjectManager />;
      case ActiveTab.TEAM:
        return <TeamManager />;
      case ActiveTab.TESTIMONIALS:
        return <TestimonialsManager />;
      case ActiveTab.PRODUCT_TYPES:
        return <ProductTypeManager />;
      default:
        return <TileManager />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get the active component title based on tab
  const getActiveComponentTitle = () => {
    switch (activeTab) {
      case ActiveTab.TILES:
        return "Tile Management";
      case ActiveTab.CATEGORIES:
        return "Category Management";
      case ActiveTab.PROJECTS:
        return "Project Management";
      case ActiveTab.TEAM:
        return "Team Management";
      case ActiveTab.TESTIMONIALS:
        return "Testimonials Management";
      case ActiveTab.PRODUCT_TYPES:
        return "Product Type Management";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Use the custom DashboardNavbar instead of regular Navbar */}
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1 bg-gray-100">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main content area with responsive padding */}
        <div className="flex-1 md:ml-64">
          {/* Dashboard header */}
          <div className="bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-semibold text-gray-800">{getActiveComponentTitle()}</h1>
              <p className="text-sm text-gray-500">Manage your tile construction resources</p>
            </div>
          </div>
          
          {/* Dashboard content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg shadow">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;