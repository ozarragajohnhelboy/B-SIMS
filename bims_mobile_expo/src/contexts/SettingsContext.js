import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsAPI } from '../services/settingsAPI';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    customLogo: null,
    sidebarColor: '#3b82f6',
    barangayName: 'Barangay',
    barangayCaptain: '',
    municipality: '',
    province: '',
    contactNumber: '',
    emailAddress: '',
    address: '',
    appName: 'B-SIMS',
  });
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadSettingsFromStorage();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      syncWithServer();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSettingsFromStorage = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setLastSync(parsedSettings.lastSync || null);
      }
      
      await syncWithServer();
    } catch (error) {
      console.error('Error loading settings from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithServer = async () => {
    try {
      const serverSettings = await settingsAPI.getSettings();
      
      if (serverSettings && Object.keys(serverSettings).length > 0) {
        const updatedSettings = {
          customLogo: serverSettings.customLogo || settings.customLogo,
          sidebarColor: serverSettings.sidebarColor || settings.sidebarColor,
          barangayName: serverSettings.barangayName || serverSettings.barangay_name || settings.barangayName,
          barangayCaptain: serverSettings.barangayCaptain || serverSettings.barangay_captain || settings.barangayCaptain,
          municipality: serverSettings.municipality || settings.municipality,
          province: serverSettings.province || settings.province,
          contactNumber: serverSettings.contactNumber || serverSettings.contact_number || settings.contactNumber,
          emailAddress: serverSettings.emailAddress || serverSettings.email_address || settings.emailAddress,
          address: serverSettings.address || settings.address,
          appName: serverSettings.barangayName || serverSettings.barangay_name || settings.barangayName || 'B-SIMS',
          lastSync: new Date().toISOString(),
        };

        const hasChanges = JSON.stringify(updatedSettings) !== JSON.stringify(settings);
        if (hasChanges) {
          setSettings(updatedSettings);
          await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
          console.log('Settings synced with server');
        }
      }
    } catch (error) {
      console.error('Error syncing settings with server:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await syncWithServer();
    setLoading(false);
  };

  const value = {
    settings,
    loading,
    lastSync,
    updateSettings,
    refreshSettings,
    syncWithServer,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
