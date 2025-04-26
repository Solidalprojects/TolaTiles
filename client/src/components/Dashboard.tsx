// client/src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import DashboardSidebar from './DashboardSidebar';
import TileManager from './TileManager';
import CategoryManager from './CategoryManager';
import ProjectManager from './ProjectManager';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.TILES);
  
  
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

// client/src/components/DashboardSidebar.tsx
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

enum ActiveTab {
  TILES = 'tiles',
  CATEGORIES = 'categories',
  PROJECTS = 'projects',
}

interface DashboardSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>Tiles Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li
            className={activeTab === ActiveTab.TILES ? 'active' : ''}
            onClick={() => setActiveTab(ActiveTab.TILES)}
          >
            Manage Tiles
          </li>
          <li
            className={activeTab === ActiveTab.CATEGORIES ? 'active' : ''}
            onClick={() => setActiveTab(ActiveTab.CATEGORIES)}
          >
            Manage Categories
          </li>
          <li
            className={activeTab === ActiveTab.PROJECTS ? 'active' : ''}
            onClick={() => setActiveTab(ActiveTab.PROJECTS)}
          >
            Manage Projects
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;