// client/src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import DashboardSidebar from './DasboardsSidebar';
import TileManager from './TileManager';
import CategoryManager from './CategoryManager';
import ProjectManager from './ProjectManager';
import { ActiveTab } from '../types/types';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.TILES);
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/auth/login');
    }
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

  return (
    <div className="dashboard-container">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="dashboard-content">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Dashboard;