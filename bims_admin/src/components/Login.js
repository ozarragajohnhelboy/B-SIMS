import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [barangayData, setBarangayData] = useState({
    barangayName: 'Barangay',
    municipality: '',
    province: ''
  });
  const [customLogo, setCustomLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedBarangayData = localStorage.getItem('barangayData');
    if (savedBarangayData) {
      try {
        const data = JSON.parse(savedBarangayData);
        setBarangayData({
          barangayName: data.barangayName || 'Barangay',
          municipality: data.municipality || '',
          province: data.province || ''
        });
      } catch (e) {
        console.error('Error parsing barangay data:', e);
      }
    }

    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }

    const savedColor = localStorage.getItem('sidebarColor');
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      showAlert('error', 'Username is required');
      return;
    }
    
    if (!formData.password.trim()) {
      showAlert('error', 'Password is required');
      return;
    }

    const result = await login(formData);
    if (result.success) {
      showAlert('success', 'Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      showAlert('error', result.error || 'Login failed');
    }
  };

  const getLocationText = () => {
    const parts = [];
    if (barangayData.municipality) parts.push(barangayData.municipality);
    if (barangayData.province) parts.push(barangayData.province);
    return parts.length > 0 ? parts.join(', ') : '';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 space-y-8 border border-gray-100">
            <div className="text-center space-y-4">
              {customLogo ? (
                <div className="flex justify-center">
                  <div 
                    className="w-24 h-24 rounded-full shadow-lg border-4 overflow-hidden"
                    style={{ borderColor: primaryColor }}
                  >
                    <img 
                      src={customLogo} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div 
                    className="w-24 h-24 rounded-full shadow-lg flex items-center justify-center text-white text-4xl font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {barangayData.barangayName.charAt(0)}
                  </div>
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {barangayData.barangayName}
                </h1>
                {getLocationText() && (
                  <p className="text-sm text-gray-600 mb-3">
                    {getLocationText()}
                  </p>
                )}
                <div 
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Admin Dashboard
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mt-4">
                Sign in to manage your barangay
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent text-gray-900 placeholder-gray-400 sm:text-sm transition-colors"
                      style={{ 
                        '--tw-ring-color': primaryColor,
                      }}
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent text-gray-900 placeholder-gray-400 sm:text-sm transition-colors"
                      style={{ 
                        '--tw-ring-color': primaryColor,
                      }}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: primaryColor,
                  '--tw-ring-color': primaryColor,
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg className="ml-2 -mr-1 h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
              <p>Barangay Information Management System</p>
              <p className="mt-1">Version 1.0</p>
            </div>
          </div>
        </div>
      </div>

      <Alert
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ show: false, type: '', message: '' })}
      />
    </div>
  );
};

export default Login;
