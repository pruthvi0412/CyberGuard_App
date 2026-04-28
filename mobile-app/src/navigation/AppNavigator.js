import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useAuthStore from '../hooks/useAuthStore';

// Screens
import LoginScreen           from '../screens/LoginScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import HomeScreen            from '../screens/HomeScreen';
import SubmitComplaintScreen from '../screens/SubmitComplaintScreen';
import TrackScreen           from '../screens/TrackScreen';
import AdminScreen           from '../screens/AdminScreen';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import ProfileScreen         from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS = { Home: '🏠', Submit: '📝', Track: '🔍', Admin: '⚙️', Profile: '👤' };

const SCREEN_OPTIONS = {
  headerStyle:     { backgroundColor: '#0C1428' },
  headerTintColor: '#00B4FF',
  headerTitleStyle:{ fontWeight: '700', fontSize: 15 },
  contentStyle:    { backgroundColor: '#0A0F1E' },
};

function UserTabs() {
  const { isAdmin } = useAuthStore();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => (
        <View style={{ fontSize: 20 }}>
          {/* RN doesn't render emoji via tabBarIcon text directly, so we use a Text */}
          <View><View /></View>
        </View>
      ),
      tabBarLabel: route.name,
      tabBarActiveTintColor:   '#00B4FF',
      tabBarInactiveTintColor: '#5A6480',
      tabBarStyle: { backgroundColor: '#0C1428', borderTopColor: 'rgba(0,180,255,0.15)', height: 58, paddingBottom: 6 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      headerShown: false,
    })}>
      <Tab.Screen name="Home"   component={HomeScreen}   options={{ tabBarLabel: '🏠 Home'    }} />
      <Tab.Screen name="Submit" component={SubmitComplaintScreen} options={{ tabBarLabel: '📝 Report' }} />
      <Tab.Screen name="Track"  component={TrackScreen}  options={{ tabBarLabel: '🔍 Track'   }} />
      {isAdmin() && <Tab.Screen name="Admin" component={AdminScreen} options={{ tabBarLabel: '⚙️ Admin' }} />}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '👤 Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, hydrated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, []);

  if (!hydrated) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0F1E' }}>
      <ActivityIndicator size="large" color="#00B4FF" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        {!user ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen}    options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main"             component={UserTabs}             options={{ headerShown: false }} />
            <Stack.Screen name="ComplaintDetail"  component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
