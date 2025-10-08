import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }),
  getProfile: () => api.get('/auth/profile/'),
};

export const puroksAPI = {
  getPuroks: (params) => api.get('/residents/puroks/', { params }),
  getPurok: (id) => api.get(`/residents/puroks/${id}/`),
  createPurok: (data) => api.post('/residents/puroks/', data),
  updatePurok: (id, data) => api.put(`/residents/puroks/${id}/`, data),
  deletePurok: (id) => api.delete(`/residents/puroks/${id}/`),
};

export const householdsAPI = {
  getHouseholds: (params) => api.get('/residents/households/', { params }),
  getHousehold: (id) => api.get(`/residents/households/${id}/`),
  createHousehold: (data) => api.post('/residents/households/', data),
  updateHousehold: (id, data) => api.put(`/residents/households/${id}/`, data),
  deleteHousehold: (id) => api.delete(`/residents/households/${id}/`),
};

export const residentsAPI = {
  getResidents: (params) => api.get('/residents/', { params }),
  getResident: (id) => api.get(`/residents/${id}/`),
  createResident: (data) => api.post('/residents/', data),
  updateResident: (id, data) => api.put(`/residents/${id}/`, data),
  deleteResident: (id) => api.delete(`/residents/${id}/`),
  getStats: () => api.get('/residents/stats/'),
};

export const documentsAPI = {
  getDocumentTypes: (params) => api.get('/residents/documents/types/', { params }),
  getDocumentType: (id) => api.get(`/residents/documents/types/${id}/`),
  createDocumentType: (data) => api.post('/residents/documents/types/', data),
  updateDocumentType: (id, data) => api.put(`/residents/documents/types/${id}/`, data),
  deleteDocumentType: (id) => api.delete(`/residents/documents/types/${id}/`),
  getDocumentRequests: (params) => api.get('/residents/documents/requests/', { params }),
  getDocumentRequest: (id) => api.get(`/residents/documents/requests/${id}/`),
  createDocumentRequest: (data) => api.post('/residents/documents/requests/', data),
  updateDocumentRequest: (id, data) => api.put(`/residents/documents/requests/${id}/`, data),
  deleteDocumentRequest: (id) => api.delete(`/residents/documents/requests/${id}/`),
  getDocumentStats: () => api.get('/residents/documents/stats/'),
};

export const blottersAPI = {
  getBlotters: (params) => api.get('/residents/blotters/', { params }),
  getBlotter: (id) => api.get(`/residents/blotters/${id}/`),
  createBlotter: (data) => api.post('/residents/blotters/', data),
  updateBlotter: (id, data) => api.put(`/residents/blotters/${id}/`, data),
  deleteBlotter: (id) => api.delete(`/residents/blotters/${id}/`),
  getBlotterStats: () => api.get('/residents/blotters/stats/'),
};

export const settingsAPI = {
  getSettings: () => api.get('/core/settings/'),
  updateSettings: (data) => api.post('/core/settings/', data),
  getConfigurations: (params) => api.get('/core/configurations/', { params }),
  getConfiguration: (id) => api.get(`/core/configurations/${id}/`),
  createConfiguration: (data) => api.post('/core/configurations/', data),
  updateConfiguration: (id, data) => api.put(`/core/configurations/${id}/`, data),
  deleteConfiguration: (id) => api.delete(`/core/configurations/${id}/`),
};

export default api;
