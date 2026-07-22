import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      // Notification Settings
      pushEnabled: true,
      emailReports: false,
      silentMode: false,
      notificationSound: 'Cyber Pulse (Default)',

      // Display Settings
      accentGlow: true,
      highContrast: false,

      // Privacy Settings
      anonymousReporting: true,
      activityLogging: true,

      // Performance Settings
      hardwareAcceleration: true,
      lowLatencyMode: false,
      offlineMode: true,
      animationSpeed: 100,

      setSetting: (key, value) => set({ [key]: value }),
      
      resetSettings: () => set({
        pushEnabled: true,
        emailReports: false,
        silentMode: false,
        notificationSound: 'Cyber Pulse (Default)',
        accentGlow: true,
        highContrast: false,
        anonymousReporting: true,
        activityLogging: true,
        hardwareAcceleration: true,
        lowLatencyMode: false,
        offlineMode: true,
        animationSpeed: 100,
      })
    }),
    {
      name: 'user-app-settings',
    }
  )
);

export default useSettingsStore;
