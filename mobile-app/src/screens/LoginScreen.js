import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Error', 'Enter email and password');
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={styles.logo}><Text style={{ fontSize: 32 }}>🛡️</Text></View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.electric, letterSpacing: 2 }}>
              CYBERGUARD
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
              AI Cybercrime Reporting Platform
            </Text>
          </View>

          {/* Form */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.label}>Email Address</Text>
            <TextInput style={globalStyles.input} placeholder="you@example.com"
              placeholderTextColor={colors.muted} value={email}
              onChangeText={setEmail} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} />

            <Text style={globalStyles.label}>Password</Text>
            <TextInput style={globalStyles.input} placeholder="Your password"
              placeholderTextColor={colors.muted} value={password}
              onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 8 }]}
              onPress={handleLogin} disabled={loading}>
              <Text style={globalStyles.btnPrimaryText}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo hint */}
          <View style={[globalStyles.card, { backgroundColor: 'rgba(0,180,255,0.05)' }]}>
            <Text style={{ color: colors.electric, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>DEMO ADMIN</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>admin@cybercrime.gov</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Admin@123456</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              Don't have an account?{' '}
              <Text style={{ color: colors.electric, fontWeight: '700' }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: colors.cyber, alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
    shadowColor: colors.electric, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
});
