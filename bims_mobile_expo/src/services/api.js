import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';

const BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', {
      ...userData,
      role: 'resident',
      is_approved: false,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password/', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  },
};

export const residentsAPI = {
  getResidents: async () => {
    const response = await api.get('/residents/');
    return response.data;
  },

  getResident: async (id) => {
    const response = await api.get(`/residents/${id}/`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await api.patch(`/residents/${id}/`, data);
    return response.data;
  },
};

export const documentsAPI = {
  getDocuments: async () => {
    const response = await api.get('/documents/');
    return response.data;
  },

  createDocumentRequest: async (data) => {
    const response = await api.post('/documents/', data);
    return response.data;
  },

  getDocumentTypes: async () => {
    const response = await api.get('/documents/types/');
    return response.data;
  },
};

export const announcementsAPI = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements/');
    return response.data;
  },

  getAnnouncement: async (id) => {
    const response = await api.get(`/announcements/${id}/`);
    return response.data;
  },
};

export const blottersAPI = {
  getBlotters: async () => {
    const response = await api.get('/blotters/');
    return response.data;
  },

  createBlotter: async (data) => {
    const response = await api.post('/blotters/', data);
    return response.data;
  },
};

export const financialAPI = {
  getFinancialReports: async () => {
    const response = await api.get('/financial/reports/');
    return response.data;
  },

  getIncomeRecords: async () => {
    const response = await api.get('/financial/income/');
    return response.data;
  },

  getExpenseRecords: async () => {
    const response = await api.get('/financial/expense/');
    return response.data;
  },
};

export default api;
