// client/src/components/DashboardSidebar.tsx
import { useState, useEffect } from 'react';
import { logout, getCurrentUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { ActiveTab } from '../types/types';
import { 
  Grid, Tag, Briefcase, Users, MessageSquare, 
  LogOut, Menu, X, Box
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.user) {
      setUserName(user.user.username || 'Admin');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Navigation items
  const navItems = [
    {
      id: ActiveTab.TILES,
      label: 'Manage Tiles',
      icon: <Grid size={20} className="mr-2" />
    },
    {
      id: ActiveTab.CATEGORIES,
      label: 'Manage Categories',
      icon: <Tag size={20} className="mr-2" />
    },
    {
      id: ActiveTab.PRODUCT_TYPES,
      label: 'Manage Product Types',
      icon: <Box size={20} className="mr-2" />
    },
    {
      id: ActiveTab.PROJECTS,
      label: 'Manage Projects',
      icon: <Briefcase size={20} className="mr-2" />
    },
    {
      id: ActiveTab.TEAM,
      label: 'Manage Team',
      icon: <Users size={20} className="mr-2" />
    },
    {
      id: ActiveTab.TESTIMONIALS,
      label: 'Manage Testimonials',
      icon: <MessageSquare size={20} className="mr-2" />
    }
  ];

  // Desktop sidebar - Updated with black theme
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-black to-gray-900 text-white h-screen fixed">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-300 text-sm mt-1">Welcome, {userName}</p>
      </div>
      
      <nav className="flex-grow py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
                activeTab === item.id 
                  ? 'bg-gray-800 text-white font-medium' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-gray-800">
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors text-white"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );

  // Mobile sidebar header
  const MobileSidebarHeader = () => (
    <div className="md:hidden flex justify-between items-center bg-black p-4 text-white">
      <h2 className="text-lg font-bold">Admin Dashboard</h2>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="focus:outline-none"
      >
        {isMobileMenuOpen ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>
    </div>
  );

  // Mobile sidebar menu - Updated with black theme
  const MobileSidebarMenu = () => (
    isMobileMenuOpen && (
      <div className="md:hidden bg-gray-900 shadow-lg text-white">
        <div className="px-4 py-2 border-b border-gray-800">
          <p className="text-gray-300 text-sm">Welcome, {userName}</p>
        </div>
        <nav className="py-2">
          <ul>
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                  activeTab === item.id 
                    ? 'bg-gray-800 text-white font-medium' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors text-white"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    )
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebarHeader />
      <MobileSidebarMenu />
    </>
  );
};

export default DashboardSidebar;