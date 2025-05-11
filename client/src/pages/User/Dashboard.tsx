// src/pages/User/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { 
  User, Settings, MessageSquare, Bell, FileText, 
  Home, LogOut, ChevronRight, Calendar, Clock
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { hasUnreadMessages, unreadCount, contactAdmin } = useChat();
  const [greeting, setGreeting] = useState<string>('Hello');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Set current time and date
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800">User Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Bell size={24} className="text-gray-600 cursor-pointer" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </div>
            
            {/* Messages */}
            <Link to="/user/messages" className="relative">
              <MessageSquare size={24} className="text-gray-600" />
              {hasUnreadMessages && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            
            {/* User menu */}
            <Link to="/user/profile" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                {user.first_name ? user.first_name[0] : user.username[0]}
              </div>
              <span className="text-gray-800 font-medium">{user.first_name || user.username}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {greeting}, {user.first_name || user.username}!
              </h2>
              <p className="text-gray-600 mt-1">Welcome to your personal dashboard</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center text-gray-500">
                <Calendar size={18} className="mr-2" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center text-gray-500 mt-1">
                <Clock size={18} className="mr-2" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/user/profile" 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <User size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Update Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">Update your personal information and preferences</p>
            <div className="flex items-center text-blue-600">
              <span className="font-medium">Manage Profile</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>

          <Link 
            to="/user/messages" 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
              {hasUnreadMessages && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">View your conversations and message history</p>
            <div className="flex items-center text-green-600">
              <span className="font-medium">View Messages</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>

          <Link 
            to="/user/settings" 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                <Settings size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage your account preferences and security</p>
            <div className="flex items-center text-purple-600">
              <span className="font-medium">Update Settings</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>
        </div>

        {/* Contact Admin section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <MessageSquare size={24} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">Need help? Contact an admin</h3>
              <p className="text-gray-600 mt-1 mb-4">
                Our team is ready to assist you with any questions or issues you may have.
              </p>
              <Link 
                to="/user/contact-admin" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Contact Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            <Link 
              to="/" 
              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
            >
              <Home size={20} className="text-gray-500 mr-3" />
              <span className="text-gray-800">Back to Home</span>
            </Link>
            
            <Link 
              to="/user/documents" 
              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
            >
              <FileText size={20} className="text-gray-500 mr-3" />
              <span className="text-gray-800">My Documents</span>
            </Link>
            
            <button 
              onClick={logout}
              className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut size={20} className="text-red-500 mr-3" />
              <span className="text-red-500">Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;