import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0A0F1E" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
