import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user:    null,
  token:   null,
  loading: false,
  hydrated: false,

  hydrate: async () => {
    const user  = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('accessToken');
    set({ user: user ? JSON.parse(user) : null, token, hydrated: true });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = data.data;
      await AsyncStorage.setItem('accessToken',  accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token: accessToken, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  },

  register: async (form) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register(form);
      const { user, accessToken, refreshToken } = data.data;
      await AsyncStorage.setItem('accessToken',  accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token: accessToken, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  },

  logout: async () => {
    try { await authAPI.logout(); } catch {}
    await AsyncStorage.multiRemove(['accessToken','refreshToken','user']);
    set({ user: null, token: null });
  },

  isAdmin:   () => ['admin','officer'].includes(get().user?.role),
}));

export default useAuthStore;
