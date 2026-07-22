import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert,
  ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles } from '../utils/theme';

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    if (form.name.length < 2) return Alert.alert('Error', 'Name too short');
    if (!form.email.includes('@')) return Alert.alert('Error', 'Invalid email');
    if (form.password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
    if (form.password !== form.confirm) return Alert.alert('Error', 'Passwords do not match');
    try {
      await register({ name: form.name, email: form.email.toLowerCase(),
        phone: form.phone, password: form.password });
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    }
  };

  const field = (key, label, props = {}) => (
    <>
      <Text style={globalStyles.label}>{label}</Text>
      <TextInput style={globalStyles.input} placeholderTextColor={colors.muted}
        value={form[key]} onChangeText={v => set(key, v)} {...props} />
    </>
  );

  return (
    <SafeAreaView style={globalStyles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>

          <View style={{ alignItems: 'center', marginBottom: 28, marginTop: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.electric, letterSpacing: 2 }}>CREATE ACCOUNT</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>Join CyberGuard today</Text>
          </View>

          <View style={globalStyles.card}>
            {field('name',    'Full Name',     { placeholder: 'John Doe' })}
            {field('email',   'Email Address', { placeholder: 'you@example.com', keyboardType: 'email-address', autoCapitalize: 'none' })}
            {field('phone',   'Phone (optional)', { placeholder: '9XXXXXXXXX', keyboardType: 'phone-pad' })}
            {field('password','Password',      { placeholder: 'Min 8 chars', secureTextEntry: true })}
            {field('confirm', 'Confirm Password', { placeholder: 'Re-enter password', secureTextEntry: true })}

            <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 6 }]}
              onPress={handleRegister} disabled={loading}>
              <Text style={globalStyles.btnPrimaryText}>
                {loading ? 'Creating Account…' : 'Create Account →'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              Already registered?{' '}
              <Text style={{ color: colors.electric, fontWeight: '700' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
