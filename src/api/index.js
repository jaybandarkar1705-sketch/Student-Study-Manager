import api from './axios';

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const subjectsAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

export const studySessionsAPI = {
  getAll: (params) => api.get('/study-sessions', { params }),
  create: (data) => api.post('/study-sessions', data),
  update: (id, data) => api.put(`/study-sessions/${id}`, data),
  delete: (id) => api.delete(`/study-sessions/${id}`),
};

export const studyPlansAPI = {
  getAll: (params) => api.get('/study-plans', { params }),
  create: (data) => api.post('/study-plans', data),
  update: (id, data) => api.put(`/study-plans/${id}`, data),
  delete: (id) => api.delete(`/study-plans/${id}`),
};

export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const examsAPI = {
  getAll: (params) => api.get('/exams', { params }),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const goalsAPI = {
  getAll: (params) => api.get('/goals', { params }),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getStudyHours: () => api.get('/analytics/study-hours'),
  getTaskProgress: () => api.get('/analytics/task-progress'),
  getSubjectProgress: () => api.get('/analytics/subject-progress'),
  getInsights: () => api.get('/analytics/insights'),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updateSettings: (data) => api.put('/profile/settings', data),
};
