import api from './api';

export const settingsAPI = {
  getSettings: async () => {
    try {
      const response = await api.get('/core/settings/');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Settings API requires authentication - skipping');
        return {};
      }
      console.error('Settings API error:', error);
      return {};
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.patch('/core/settings/', settings);
      return response.data;
    } catch (error) {
      console.error('Settings update error:', error);
      throw error;
    }
  },
};
