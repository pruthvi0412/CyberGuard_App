import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert,
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles } from '../utils/theme';
import CyberBackground from '../components/CyberBackground';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={[globalStyles.screen, { backgroundColor: '#0A0F1E' }]}>
      <CyberBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={styles.logoText}>CRMS</Text>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 4, marginTop: 4 }}>
              CYBER GUARD
            </Text>
            <View style={styles.divider} />
          </View>

          {/* Form */}
          <View style={styles.glassCard}>
            <Text style={styles.formTitle}>Secure Access</Text>
            
            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>EMAIL</Text>
              <TextInput style={styles.input} placeholder="Enter your credentials"
                placeholderTextColor={colors.muted} value={email}
                onChangeText={setEmail} keyboardType="email-address"
                autoCapitalize="none" autoCorrect={false} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>PASSWORD</Text>
              <TextInput style={styles.input} placeholder="••••••••"
                placeholderTextColor={colors.muted} value={password}
                onChangeText={setPassword} secureTextEntry />
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={loading}>
              <LinearGradient
                colors={['#00FFD1', '#00B4FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'monospace',
    textShadowColor: 'rgba(0, 180, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: colors.accent,
    marginTop: 15,
    borderRadius: 2,
  },
  glassCard: {
    backgroundColor: 'rgba(12, 20, 40, 0.85)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 180, 255, 0.3)',
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius: 8,
  },
  loginBtn: {
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#0A0F1E',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  }
});


