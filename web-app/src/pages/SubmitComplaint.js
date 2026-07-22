import axios from 'axios';

// 1. Configure the base connection to your Railway Backend
const API = axios.create({
  baseURL: 'https://invigorating-fulfillment-production-667e.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add an Interceptor (Optional but helpful)
// This automatically attaches your JWT token if the user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Define your API calls
export const complaintsAPI = {
  // Create a new complaint (handles the Title, Date, and Files)
  create: (formData) => API.post('/complaints', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data' 
    }
  }),

  // Fetch all complaints for the dashboard
  getAll: () => API.get('/complaints'),

  // Fetch a single complaint by ID
  getById: (id) => API.get(`/complaints/${id}`),
};

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

export default API;