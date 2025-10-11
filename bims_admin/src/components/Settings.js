import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, settingsAPI } from '../services/api';
import Alert from './Alert';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [sidebarColor, setSidebarColor] = useState('#3B82F6');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const getInitialBarangayData = () => {
    const saved = localStorage.getItem('barangayData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved barangay data:', e);
      }
    }
    return {
      barangayName: 'Barangay Sample',
      barangayCaptain: 'Juan Dela Cruz',
      municipality: 'Sample City',
      province: 'Sample Province',
      contactNumber: '+63 912 345 6789',
      emailAddress: 'barangay@sample.com',
      address: '123 Main Street, Sample Barangay, Sample City, Sample Province'
    };
  };

  const [barangayData, setBarangayData] = useState(getInitialBarangayData());
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const localData = localStorage.getItem('barangayData');
        if (localData) {
          const parsedData = JSON.parse(localData);
          setBarangayData(parsedData);
        } else {
          const settings = await settingsAPI.getSettings();
          if (settings && Object.keys(settings).length > 0) {
            const newBarangayData = {
              barangayName: settings.barangayName || settings.barangay_name || 'Barangay Sample',
              barangayCaptain: settings.barangayCaptain || settings.barangay_captain || 'Juan Dela Cruz',
              municipality: settings.municipality || 'Sample City',
              province: settings.province || 'Sample Province',
              contactNumber: settings.contactNumber || settings.contact_number || '+63 912 345 6789',
              emailAddress: settings.emailAddress || settings.email || 'barangay@sample.com',
              address: settings.address || '123 Main Street, Sample Barangay, Sample City, Sample Province'
            };
            setBarangayData(newBarangayData);
            localStorage.setItem('barangayData', JSON.stringify(newBarangayData));
          }
        }
        
        const savedLogo = localStorage.getItem('customLogo');
        if (savedLogo) {
          setLogoPreview(savedLogo);
        }
        
        const savedColor = localStorage.getItem('sidebarColor');
        if (savedColor) {
          setSidebarColor(savedColor);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const logoData = e.target.result;
        setLogoPreview(logoData);
        localStorage.setItem('customLogo', logoData);
        
        try {
          await settingsAPI.updateSettings({
            customLogo: logoData,
            sidebarColor: sidebarColor
          });
          showAlert('success', 'Logo saved successfully');
        } catch (error) {
          showAlert('error', 'Failed to save logo to database');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = async (color) => {
    setSidebarColor(color);
    localStorage.setItem('sidebarColor', color);
    document.documentElement.style.setProperty('--sidebar-color', color);
    
    try {
      await settingsAPI.updateSettings({
        customLogo: logoPreview,
        sidebarColor: color
      });
      showAlert('success', 'Color saved successfully');
    } catch (error) {
      showAlert('error', 'Failed to save color to database');
    }
    
    const event = new CustomEvent('sidebarColorChange', { detail: { color } });
    window.dispatchEvent(event);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleBarangayDataChange = (field, value) => {
    setBarangayData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      localStorage.setItem('barangayData', JSON.stringify(newData));
      return newData;
    });
  };

  const handleSaveBarangayData = async () => {
    setLoading(true);
    try {
      localStorage.setItem('barangayData', JSON.stringify(barangayData));
      
      const settingsToSave = {
        barangayName: barangayData.barangayName,
        barangay_name: barangayData.barangayName,
        barangayCaptain: barangayData.barangayCaptain,
        barangay_captain: barangayData.barangayCaptain,
        municipality: barangayData.municipality,
        province: barangayData.province,
        contactNumber: barangayData.contactNumber,
        contact_number: barangayData.contactNumber,
        emailAddress: barangayData.emailAddress,
        email: barangayData.emailAddress,
        address: barangayData.address
      };
      
      await settingsAPI.updateSettings(settingsToSave);
      showAlert('success', 'Barangay information saved successfully');
    } catch (error) {
      showAlert('error', 'Failed to save barangay information');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      showAlert('success', 'Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showAlert('error', 'Failed to change password: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application preferences and security settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appearance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Barangay Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barangay Name</label>
                    <input
                      type="text"
                      value={barangayData.barangayName}
                      onChange={(e) => handleBarangayDataChange('barangayName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barangay Captain</label>
                    <input
                      type="text"
                      value={barangayData.barangayCaptain}
                      onChange={(e) => handleBarangayDataChange('barangayCaptain', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Municipality/City</label>
                    <input
                      type="text"
                      value={barangayData.municipality}
                      onChange={(e) => handleBarangayDataChange('municipality', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <input
                      type="text"
                      value={barangayData.province}
                      onChange={(e) => handleBarangayDataChange('province', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      value={barangayData.contactNumber}
                      onChange={(e) => handleBarangayDataChange('contactNumber', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={barangayData.emailAddress}
                      onChange={(e) => handleBarangayDataChange('emailAddress', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    rows={3}
                    value={barangayData.address}
                    onChange={(e) => handleBarangayDataChange('address', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSaveBarangayData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Settings</h3>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Custom Logo"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <span className="text-gray-400 text-sm">Logo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Logo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended size: 128x128 pixels. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sidebar Color</h3>
                <div className="grid grid-cols-4 gap-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorChange(color.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        sidebarColor === color.value
                          ? 'border-gray-900 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <p className="text-sm text-gray-600 mt-2">{color.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600">Last changed: Never</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Login Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 capitalize"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Alert
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ show: false, type: '', message: '' })}
      />
    </div>
  );
};

export default Settings;