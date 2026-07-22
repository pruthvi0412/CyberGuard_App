import { create } from 'zustand';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create((set, get) => ({
  user:    JSON.parse(localStorage.getItem('user') || 'null'),
  token:   localStorage.getItem('accessToken') || null,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      
      if (data.status === 'mfa_required') {
        set({ loading: false });
        return { mfaRequired: true, userId: data.data.userId };
      }

      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      connectSocket(user.id, user.role === 'admin');
      set({ user, token: accessToken, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  verify2FA: async (userId, token) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login2FA({ userId, token });
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      connectSocket(user.id, user.role === 'admin');
      set({ user, token: accessToken, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(formData);
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      connectSocket(user.id, false);
      set({ user, token: accessToken, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.clear();
    disconnectSocket();
    set({ user: null, token: null });
  },

  syncUser: async () => {
    try {
      const { data } = await authAPI.getMe();
      const user = data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (err) {
      console.error("Failed to sync user data", err);
    }
  },

  clearError: () => set({ error: null }),

  isAdmin:   () => get().user?.role === 'admin',
  isOfficer: () => ['admin','officer'].includes(get().user?.role),
}));

export default useAuthStore;
