// client/src/components/DashboardSidebar.tsx
import { useState, useEffect } from 'react';
import { logout, getCurrentUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { ActiveTab } from '../types/types';

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
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      )
    },
    {
      id: ActiveTab.CATEGORIES,
      label: 'Manage Categories',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      )
    },
    {
      id: ActiveTab.PROJECTS,
      label: 'Manage Projects',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      )
    }
  ];

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:flex-col w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed">
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-xl font-bold">Tiles Admin</h2>
        <p className="text-blue-300 text-sm mt-1">Welcome, {userName}</p>
      </div>
      
      <nav className="flex-grow py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-700 text-white font-medium' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-blue-800">
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors text-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  // Mobile sidebar header
  const MobileSidebarHeader = () => (
    <div className="md:hidden flex justify-between items-center bg-blue-900 p-4 text-white">
      <h2 className="text-lg font-bold">Tiles Admin</h2>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="focus:outline-none"
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
  );

  // Mobile sidebar menu
  const MobileSidebarMenu = () => (
    isMobileMenuOpen && (
      <div className="md:hidden bg-blue-800 shadow-lg text-white">
        <div className="px-4 py-2 border-b border-blue-700">
          <p className="text-blue-300 text-sm">Welcome, {userName}</p>
        </div>
        <nav className="py-2">
          <ul>
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-700 text-white font-medium' 
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white'
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
        <div className="p-4 border-t border-blue-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
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