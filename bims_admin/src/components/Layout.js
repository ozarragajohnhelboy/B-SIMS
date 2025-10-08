import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Residents', path: '/residents' },
    { name: 'Households', path: '/households' },
    { name: 'Documents', path: '/documents' },
    { name: 'Blotters', path: '/blotters' },
    { name: 'Reports', path: '/reports' },
    { name: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">B-SIMS</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-gray-500 transform rotate-45 absolute"></div>
              <div className="w-4 h-0.5 bg-gray-500 transform -rotate-45 absolute"></div>
            </div>
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></div>
                {item.name}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
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
            Sign out
          </button>
        </div>
      </div>
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
        <header className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-500"></div>
                <div className="w-full h-0.5 bg-gray-500"></div>
                <div className="w-full h-0.5 bg-gray-500"></div>
              </div>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                Barangay Smart Information Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-semibold">
                  {formatPhilippinesTime(currentTime)}
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
