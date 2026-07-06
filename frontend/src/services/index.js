import api from './api';

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
  getUsers: (role) => api.get('/users', { params: role ? { role } : {} }),
};

export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, comment) => api.post(`/tickets/${id}/comment`, { comment }),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
};

export const slaAPI = {
  getAll: () => api.get('/sla'),
  update: (ticketId, data) => api.put(`/sla/${ticketId}`, data),
};

export const dashboardAPI = {
  admin: () => api.get('/dashboard/admin'),
  agent: () => api.get('/dashboard/agent'),
  customer: () => api.get('/dashboard/customer'),
};
