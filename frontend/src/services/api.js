import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * System API
 */
export const systemAPI = {
  health: () => api.get('/health'),
  dbTest: () => api.get('/api/db-test'),
  systemInfo: () => api.get('/api/system'),
};

/**
 * Connectors API
 */
export const connectorsAPI = {
  // CRUD
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.provider) params.append('provider', filters.provider);
    return api.get(`/api/admin/connectors${params.toString() ? '?' + params : ''}`);
  },
  
  create: (data) => api.post('/api/admin/connectors', data),
  
  getById: (id) => api.get(`/api/admin/connectors/${id}`),
  
  update: (id, data) => api.put(`/api/admin/connectors/${id}`, data),
  
  delete: (id) => api.delete(`/api/admin/connectors/${id}`),
  
  disable: (id) => api.post(`/api/admin/connectors/${id}/disable`),
  
  enable: (id) => api.post(`/api/admin/connectors/${id}/enable`),
  
  // Statistics
  getStats: (id) => api.get(`/api/admin/connectors/${id}/stats`),
  
  getAllStats: () => api.get('/api/admin/stats'),
  
  getLogs: (id, limit = 50, offset = 0) =>
    api.get(`/api/admin/connectors/${id}/logs?limit=${limit}&offset=${offset}`),
};

/**
 * Documentation API
 */
export const docsAPI = {
  listDocs: () => api.get('/api/docs'),
  
  getDoc: (id) => api.get(`/api/docs/${id}`),
  
  getHtmlDoc: (id) => api.get(`/api/docs/${id}/html`),
};

/**
 * Testing API
 */
export const testAPI = {
  test: (connectorId, testInput) =>
    api.post(`/api/admin/test/${connectorId}`, { test_input: testInput }),
  
  quickTest: (connectorId, testInput) =>
    api.post(`/api/admin/test/quick/${connectorId}`, { test_input: testInput }),
};

/**
 * Dynamic API (calling generated endpoints)
 */
export const dynamicAPI = {
  callEndpoint: (endpoint, data) =>
    api.post(`/api/connectors/${endpoint}`, data),
};

export default api;
