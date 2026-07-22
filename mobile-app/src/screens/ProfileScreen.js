import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles } from '../utils/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={[globalStyles.screen, { backgroundColor: '#0A0F1E' }]}>
      {/* Back Navigation */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ 
            width: 40, height: 40, borderRadius: 20, 
            backgroundColor: 'rgba(0, 255, 209, 0.1)', 
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(0, 255, 209, 0.3)'
          }}
        >
          <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '900' }}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={globalStyles.heading}>Profile</Text>

        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <View style={{ 
            width: 90, height: 90, borderRadius: 45,
            backgroundColor: 'rgba(0, 180, 255, 0.1)', 
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: colors.electric,
            shadowColor: colors.electric, shadowRadius: 15, shadowOpacity: 0.3
          }}>
            <Text style={{ fontSize: 36, color: '#fff', fontWeight: '900' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 15 }}>{user?.name}</Text>
          <View style={{ backgroundColor: `${colors.electric}20`, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 4, marginTop: 8 }}>
            <Text style={{ color: colors.electric, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
              {user?.role} ACCESS
            </Text>
          </View>
        </View>

        <View style={[globalStyles.card, { padding: 20, backgroundColor: 'rgba(12, 20, 40, 0.6)' }]}>
          <Text style={[globalStyles.sectionTitle, { color: colors.electric }]}>ACCOUNT PROTOCOL</Text>
          {[
            ['USER ID', user?._id?.substring(0,10).toUpperCase()],
            ['EMAIL', user?.email],
            ['SECURE STATUS', 'ACTIVE'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700' }}>{label}</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{val}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout}
          style={{ 
            backgroundColor: 'rgba(255, 82, 82, 0.1)', 
            borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.3)', 
            borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 30 
          }}>
          <Text style={{ color: '#FF5252', fontSize: 14, fontWeight: '900', letterSpacing: 2 }}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
