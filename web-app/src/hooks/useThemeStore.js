import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' | 'light' | 'system'
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initTheme: () => {
        const theme = get().theme;
        applyTheme(theme);
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);

const applyTheme = (theme) => {
  const root = window.document.documentElement;
  let actualTheme = theme;

  if (theme === 'system') {
    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.setAttribute('data-theme', actualTheme);
  
  // Set explicit background color on body to avoid flashes
  document.body.style.backgroundColor = actualTheme === 'dark' ? '#02060a' : '#f5f5f7';
};

export default useThemeStore;
