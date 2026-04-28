import axios from 'axios';

// ── CONFIGURATION ─────────────────────────────────────────────────────────────
// FIXED: Added the missing '-667e' to match your actual Railway deployment
const BASE_URL = 'https://invigorating-fulfillment-production-667e.up.railway.app/api';

const api = axios.create({ 
  baseURL: BASE_URL, 
  timeout: 15000 
});

// Attach token to every request for authenticated routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh logic on 401 (Unauthorized)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
        
        localStorage.setItem('accessToken',  data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (error) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTHENTICATION API ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)      => api.post('/auth/register', data),
  login:    (data)      => api.post('/auth/login', data),
  logout:   ()          => api.post('/auth/logout'),
  getMe:    ()          => api.get('/auth/me'),
  updatePassword: (d)   => api.patch('/auth/update-password', d),
};

// ── COMPLAINTS API ────────────────────────────────────────────────────────────
export const complaintsAPI = {
  create:       (fd)    => api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:       (p)     => api.get('/complaints', { params: p }),
  getOne:       (id)    => api.get(`/complaints/${id}`),
  track:        (id)    => api.get(`/complaints/track/${id}`),
  updateStatus: (id, d) => api.patch(`/complaints/${id}/status`, d),
  delete:       (id)    => api.delete(`/complaints/${id}`),
};

// ── ANALYTICS API ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview:      ()  => api.get('/analytics/overview'),
  byCategory:    ()  => api.get('/analytics/by-category'),
  trends:        (m) => api.get('/analytics/trends', { params: { months: m } }),
  geographic:    ()  => api.get('/analytics/geographic'),
  statusDist:    ()  => api.get('/analytics/status-distribution'),
  financial:     ()  => api.get('/analytics/financial'),
};

// ── ADMIN API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers:      (p)        => api.get('/admin/users', { params: p }),
  updateRole:    (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleStatus:  (id)       => api.patch(`/admin/users/${id}/toggle-status`),
  assignOfficer: (id, oId)  => api.patch(`/admin/complaints/${id}/assign`, { officerId: oId }),
  mlStatus:      ()         => api.get('/admin/ml-status'),
  systemStats:   ()         => api.get('/admin/system-stats'),
};

export default api;