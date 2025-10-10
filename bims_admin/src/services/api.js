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

export const financialAPI = {
  getIncomeCategories: (params) => api.get('/financial/income-categories/', { params }),
  getIncomeCategory: (id) => api.get(`/financial/income-categories/${id}/`),
  createIncomeCategory: (data) => api.post('/financial/income-categories/', data),
  updateIncomeCategory: (id, data) => api.put(`/financial/income-categories/${id}/`, data),
  deleteIncomeCategory: (id) => api.delete(`/financial/income-categories/${id}/`),
  
  getExpenseCategories: (params) => api.get('/financial/expense-categories/', { params }),
  getExpenseCategory: (id) => api.get(`/financial/expense-categories/${id}/`),
  createExpenseCategory: (data) => api.post('/financial/expense-categories/', data),
  updateExpenseCategory: (id, data) => api.put(`/financial/expense-categories/${id}/`, data),
  deleteExpenseCategory: (id) => api.delete(`/financial/expense-categories/${id}/`),
  
  getIncomes: (params) => api.get('/financial/incomes/', { params }),
  getIncome: (id) => api.get(`/financial/incomes/${id}/`),
  createIncome: (data) => api.post('/financial/incomes/', data),
  updateIncome: (id, data) => api.put(`/financial/incomes/${id}/`, data),
  deleteIncome: (id) => api.delete(`/financial/incomes/${id}/`),
  
  getExpenses: (params) => api.get('/financial/expenses/', { params }),
  getExpense: (id) => api.get(`/financial/expenses/${id}/`),
  createExpense: (data) => api.post('/financial/expenses/', data),
  updateExpense: (id, data) => api.put(`/financial/expenses/${id}/`, data),
  deleteExpense: (id) => api.delete(`/financial/expenses/${id}/`),
  
  getFinancialReports: (params) => api.get('/financial/reports/', { params }),
  getFinancialReport: (id) => api.get(`/financial/reports/${id}/`),
  createFinancialReport: (data) => api.post('/financial/reports/', data),
  updateFinancialReport: (id, data) => api.put(`/financial/reports/${id}/`, data),
  deleteFinancialReport: (id) => api.delete(`/financial/reports/${id}/`),
  generateMonthlyReport: (data) => api.post('/financial/reports/generate-monthly/', data),
  generateQuarterlyReport: (data) => api.post('/financial/reports/generate-quarterly/', data),
  getFinancialSummary: () => api.get('/financial/reports/summary/'),
  
  getTransparencyBoards: (params) => api.get('/financial/transparency/', { params }),
  getTransparencyBoard: (id) => api.get(`/financial/transparency/${id}/`),
  createTransparencyBoard: (data) => api.post('/financial/transparency/', data),
  updateTransparencyBoard: (id, data) => api.put(`/financial/transparency/${id}/`, data),
  deleteTransparencyBoard: (id) => api.delete(`/financial/transparency/${id}/`),
  getPublicTransparencyBoards: () => api.get('/financial/transparency/public/'),
};

export const projectsAPI = {
  getProjectTypes: (params) => api.get('/projects/types/', { params }),
  getProjectType: (id) => api.get(`/projects/types/${id}/`),
  createProjectType: (data) => api.post('/projects/types/', data),
  updateProjectType: (id, data) => api.put(`/projects/types/${id}/`, data),
  deleteProjectType: (id) => api.delete(`/projects/types/${id}/`),

  getProjects: (params) => api.get('/projects/', { params }),
  getProject: (id) => api.get(`/projects/${id}/`),
  createProject: (data) => api.post('/projects/', data),
  updateProject: (id, data) => api.put(`/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/projects/${id}/`),
  getProjectStats: () => api.get('/projects/stats/'),
  getProjectProgress: () => api.get('/projects/progress/'),

  getProjectPhotos: (params) => api.get('/projects/photos/', { params }),
  getProjectPhoto: (id) => api.get(`/projects/photos/${id}/`),
  createProjectPhoto: (data) => api.post('/projects/photos/', data),
  updateProjectPhoto: (id, data) => api.put(`/projects/photos/${id}/`, data),
  deleteProjectPhoto: (id) => api.delete(`/projects/photos/${id}/`),

  getProjectReceipts: (params) => api.get('/projects/receipts/', { params }),
  getProjectReceipt: (id) => api.get(`/projects/receipts/${id}/`),
  createProjectReceipt: (data) => api.post('/projects/receipts/', data),
  updateProjectReceipt: (id, data) => api.put(`/projects/receipts/${id}/`, data),
  deleteProjectReceipt: (id) => api.delete(`/projects/receipts/${id}/`),

  getProjectMilestones: (params) => api.get('/projects/milestones/', { params }),
  getProjectMilestone: (id) => api.get(`/projects/milestones/${id}/`),
  createProjectMilestone: (data) => api.post('/projects/milestones/', data),
  updateProjectMilestone: (id, data) => api.put(`/projects/milestones/${id}/`, data),
  deleteProjectMilestone: (id) => api.delete(`/projects/milestones/${id}/`),

  getCommunityEvents: (params) => api.get('/projects/events/', { params }),
  getCommunityEvent: (id) => api.get(`/projects/events/${id}/`),
  createCommunityEvent: (data) => api.post('/projects/events/', data),
  updateCommunityEvent: (id, data) => api.put(`/projects/events/${id}/`, data),
  deleteCommunityEvent: (id) => api.delete(`/projects/events/${id}/`),
  getUpcomingEvents: () => api.get('/projects/events/upcoming/'),
  getCalendarEvents: (start, end) => api.get(`/projects/events/calendar/?start=${start}&end=${end}`),
};

export const announcementsAPI = {
  getCategories: () => api.get('/announcements/categories/'),
  getCategory: (id) => api.get(`/announcements/categories/${id}/`),
  createCategory: (data) => api.post('/announcements/categories/', data),
  updateCategory: (id, data) => api.put(`/announcements/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/announcements/categories/${id}/`),
  getCategoryStats: () => api.get('/announcements/categories/stats/'),
  
  getAnnouncements: (params) => api.get('/announcements/', { params }),
  getAnnouncement: (id) => api.get(`/announcements/${id}/`),
  createAnnouncement: (data) => api.post('/announcements/', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}/`),
  publishAnnouncement: (id) => api.post(`/announcements/${id}/publish/`),
  archiveAnnouncement: (id) => api.post(`/announcements/${id}/archive/`),
  trackAnnouncementView: (id) => api.post(`/announcements/${id}/track-view/`),
  getAnnouncementStats: () => api.get('/announcements/stats/'),
  
  getTemplates: (params) => api.get('/announcements/templates/', { params }),
  getTemplate: (id) => api.get(`/announcements/templates/${id}/`),
  createTemplate: (data) => api.post('/announcements/templates/', data),
  updateTemplate: (id, data) => api.put(`/announcements/templates/${id}/`, data),
  deleteTemplate: (id) => api.delete(`/announcements/templates/${id}/`),
  sendNotification: (id, data) => api.post(`/announcements/templates/${id}/send/`, data),
};

export const coreAPI = {
  getActivities: (params) => api.get('/core/activities/', { params }),
  getRecentActivities: (limit = 10, dateFrom = null, dateTo = null) => {
    const params = { limit };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return api.get(`/core/activities/recent/`, { params });
  },
  logActivity: (data) => api.post('/core/activities/', data),
};

export const logActivity = async (action, description, metadata = {}) => {
  try {
    await coreAPI.logActivity({
      action,
      description,
      metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export default api;
