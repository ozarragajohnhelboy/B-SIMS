import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from './Alert';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [customLogo, setCustomLogo] = useState(null);
  const [sidebarColor, setSidebarColor] = useState('#3B82F6');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showAlert('success', 'Logged out successfully');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      showAlert('error', 'Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    const savedLogo = localStorage.getItem('customLogo');
    const savedColor = localStorage.getItem('sidebarColor');
    if (savedLogo) setCustomLogo(savedLogo);
    if (savedColor) setSidebarColor(savedColor);

    const handleColorChange = (event) => {
      setSidebarColor(event.detail.color);
    };

    window.addEventListener('sidebarColorChange', handleColorChange);
    return () => window.removeEventListener('sidebarColorChange', handleColorChange);
  }, []);

  const getIconComponent = (iconName) => {
    const iconStyles = {
      dashboard: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
        </div>
      ),
      residents: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
          <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
        </div>
      ),
      households: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-3 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 left-0.5 w-3 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-2.5 left-0.5 w-2 h-1 bg-white rounded-sm"></div>
        </div>
      ),
      documents: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
        </div>
      ),
      blotters: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-3 h-0.5 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-white rounded-sm"></div>
          <div className="absolute top-2.5 left-0.5 w-3 h-0.5 bg-white rounded-sm"></div>
        </div>
      ),
      financial: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
          <div className="absolute top-1 left-1 w-2 h-2 border border-white rounded-full"></div>
          <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-full"></div>
        </div>
      ),
      projects: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-sm"></div>
        </div>
      ),
      announcements: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-3 h-0.5 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-white rounded-sm"></div>
          <div className="absolute top-2.5 left-0.5 w-3 h-0.5 bg-white rounded-sm"></div>
        </div>
      ),
      reports: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-sm"></div>
          <div className="absolute top-0.5 left-0.5 w-1 h-3 bg-white rounded-sm"></div>
          <div className="absolute top-0.5 right-0.5 w-1 h-2 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 right-0.5 w-1 h-2 bg-white rounded-sm"></div>
        </div>
      ),
      users: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
          <div className="absolute top-0.5 left-1 w-2 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 left-1 w-2 h-1 bg-white rounded-sm"></div>
        </div>
      ),
      settings: (
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
          <div className="absolute top-1 left-1 w-2 h-2 border border-white rounded-full"></div>
          <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-full"></div>
        </div>
      )
    };
    return iconStyles[iconName] || <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>;
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', roles: ['admin', 'secretary', 'treasurer'] },
    { name: 'Residents', path: '/residents', icon: 'residents', roles: ['admin', 'secretary'] },
    { name: 'Households', path: '/households', icon: 'households', roles: ['admin', 'secretary'] },
    { name: 'Documents', path: '/documents', icon: 'documents', roles: ['admin', 'secretary'] },
    { name: 'Blotters', path: '/blotters', icon: 'blotters', roles: ['admin', 'secretary'] },
    { name: 'Financial', path: '/financial', icon: 'financial', roles: ['admin', 'treasurer'] },
    { name: 'Projects', path: '/projects', icon: 'projects', roles: ['admin'] },
    { name: 'Announcements', path: '/announcements', icon: 'announcements', roles: ['admin', 'secretary'] },
    { name: 'Reports', path: '/reports', icon: 'reports', roles: ['admin', 'treasurer'] },
    { name: 'User Management', path: '/users', icon: 'users', roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: 'settings', roles: ['admin'] },
  ];

  const isActive = (path) => location.pathname === path;

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || 'admin');
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div 
          className="flex items-center justify-between h-16 px-6 border-b border-gray-200"
          style={{ background: `linear-gradient(to right, ${sidebarColor}, ${sidebarColor}dd)` }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="Logo" 
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-8 h-8 rounded" style={{ backgroundColor: sidebarColor }}></div>
              )}
            </div>
            <h1 className="text-xl font-bold text-white">B-SIMS</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-150"
          >
            Close
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-1">
            {filteredMenuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-700 hover:shadow-sm'
                }`}
              >
                <span className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                }`}>
                  {getIconComponent(item.icon)}
                </span>
                {item.name}
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-600 capitalize font-medium">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-sm transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <div className="w-4 h-4 mr-2 relative">
              <div className="absolute inset-0 bg-red-600 rounded-sm"></div>
              <div className="absolute top-0.5 left-0.5 w-3 h-0.5 bg-white rounded-sm"></div>
              <div className="absolute top-1.5 left-0.5 w-2 h-0.5 bg-white rounded-sm"></div>
              <div className="absolute top-2.5 left-0.5 w-3 h-0.5 bg-white rounded-sm"></div>
            </div>
            Sign out
          </button>
        </div>
      </div>

      <Alert
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ show: false, type: '', message: '' })}
      />
    </>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPhilippinesTime = (date) => {
    return date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              Menu
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Barangay Smart Information Management System
                </h1>
                <p className="text-xs text-gray-500">Administrative Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 relative">
                    <div className="absolute inset-0 bg-blue-600 rounded-full"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 border border-white rounded-full"></div>
                    <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="text-sm text-blue-700 font-semibold">
                    {formatPhilippinesTime(currentTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="container mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
