// client/src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../services/auth';
import DashboardSidebar from './DasboardsSidebar';
import TileManager from './TileManager';
import CategoryManager from './CategoryManager';
import ProjectManager from './ProjectManager';
import { ActiveTab } from '../types/types';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.TILES);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }
    
    const userData = getCurrentUser();
    setUser(userData?.user || null);
    setLoading(false);

    // Set up event listeners for page unload/navigation
    const handleBeforeUnload = () => {
      // Clear session authentication when user leaves the page
      sessionStorage.removeItem('sessionAuth');
    };

    // Listen for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for navigation away from dashboard
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also remove session auth when component unmounts
      sessionStorage.removeItem('sessionAuth');
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
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
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
  );
};

export default Dashboard;