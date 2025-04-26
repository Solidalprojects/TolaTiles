// client/src/components/DashboardSidebar.tsx
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { ActiveTab } from '../types/types';

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