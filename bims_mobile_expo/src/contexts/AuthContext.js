import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, residentsAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const isAuthenticated = !!user;

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.role === 'resident' && !onboardingCompleted) {
          try {
            const residentProfile = await residentsAPI.getResident(parsedUser.id);
            if (!residentProfile) {
              setNeedsOnboarding(true);
            }
          } catch (error) {
            setNeedsOnboarding(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.access) {
        await AsyncStorage.setItem('userToken', response.access);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
        
        if (response.user.role === 'resident') {
          const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
          if (!onboardingCompleted) {
            try {
              const residentProfile = await residentsAPI.getResident(response.user.id);
              if (!residentProfile) {
                setNeedsOnboarding(true);
              }
            } catch (error) {
              setNeedsOnboarding(true);
            }
          }
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.id || response.user || response.username) {
        return { success: true };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const data = error.response.data;
        console.log('Registration error data:', JSON.stringify(data, null, 2));
        
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Registration error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('onboardingCompleted');
      setUser(null);
      setNeedsOnboarding(false);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setNeedsOnboarding(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    needsOnboarding,
    login,
    register,
    logout,
    completeOnboarding,
    checkAuthStatus,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};
