import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// Simulations API
export const simulationsAPI = {
  getAll: (params = {}) => api.get('/simulations', { params }),
  getById: (id) => api.get(`/simulations/${id}`),
  start: (id) => api.post(`/simulations/${id}/start`),
  interact: (id, data) => api.post(`/simulations/${id}/interact`, data),
  complete: (id, data) => api.post(`/simulations/${id}/complete`, data),
  getStats: (id) => api.get(`/simulations/${id}/stats`),
  getFakeWebsite: (id, params = {}) => api.get(`/simulations/${id}/fake-website`, { params }),
  submitFakeWebsite: (id, data) => api.post(`/simulations/${id}/fake-website/submit`, data),
};

// Analytics API
export const analyticsAPI = {
  getUserStats: () => api.get('/analytics/user-stats'),
  getSimulationStats: (simulationId) => api.get(`/analytics/simulation/${simulationId}`),
  getVulnerabilityAnalysis: () => api.get('/analytics/vulnerability-analysis'),
  getLearningProgress: () => api.get('/analytics/learning-progress'),
};

// Admin API
export const adminAPI = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/system-stats'),
  getSimulationStats: () => api.get('/admin/simulation-stats'),
};

// Educational Modules API
export const educationalAPI = {
  getModules: () => api.get('/educational-modules'),
  getModuleById: (id) => api.get(`/educational-modules/${id}`),
  updateProgress: (id, data) => api.put(`/educational-modules/${id}/progress`, data),
  getProgress: () => api.get('/educational-modules/progress'),
};

// Fake Websites API
export const fakeWebsitesAPI = {
  getAll: () => api.get('/fake-websites'),
  getById: (id) => api.get(`/fake-websites/${id}`),
  create: (data) => api.post('/fake-websites', data),
  update: (id, data) => api.put(`/fake-websites/${id}`, data),
  delete: (id) => api.delete(`/fake-websites/${id}`),
};

// User Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
  getActivity: () => api.get('/profile/activity'),
};

// Utility functions
export const apiUtils = {
  handleError: (error) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return { error: true, message };
  },
  
  handleSuccess: (response) => {
    return { error: false, data: response.data };
  },
};

export default api; 