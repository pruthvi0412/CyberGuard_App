import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure EXPO_PUBLIC_API_URL in mobile-app/.env for development, staging, or production.
// The localhost fallback is development-only; production builds must provide a URL.
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
if (!configuredApiUrl && !__DEV__) {
  throw new Error('EXPO_PUBLIC_API_URL must be configured for production builds.');
}
export const BASE_URL = configuredApiUrl || 'http://localhost:5002/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Bypass localtunnel reminder page
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  config.headers['User-Agent'] = 'ExpoApp'; // Some tunnels prefer a non-browser UA
  
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await AsyncStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
        await AsyncStorage.setItem('accessToken',  data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken','refreshToken','user']);
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d)   => api.post('/auth/register', d),
  login:    (d)   => api.post('/auth/login', d),
  logout:   ()    => api.post('/auth/logout'),
  getMe:    ()    => api.get('/auth/me'),
  registerPushToken: (token) => api.post('/users/push-token', { token }),
};

export const complaintsAPI = {
  create:       (fd)    => api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:       (p)     => api.get('/complaints', { params: p }),
  getOne:       (id)    => api.get(`/complaints/${id}`),
  track:        (id)    => api.get(`/complaints/track/${id}`),
  updateStatus: (id, d) => api.patch(`/complaints/${id}/status`, d),
};

export const analyticsAPI = {
  overview:   () => api.get('/analytics/overview'),
  byCategory: () => api.get('/analytics/by-category'),
  trends:     (m)=> api.get('/analytics/trends', { params: { months: m } }),
};

export const adminAPI = {
  systemStats: () => api.get('/admin/system-stats'),
  mlStatus:    () => api.get('/admin/ml-status'),
  getUsers:    () => api.get('/admin/users'),
};

export default api;
