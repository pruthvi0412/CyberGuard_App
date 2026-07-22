import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { complaintsAPI } from '../services/api';
import { colors, globalStyles, statusColors } from '../utils/theme';

export default function TrackScreen({ navigation }) {
  const [id,        setId]        = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const track = async () => {
    if (!id.trim()) return Alert.alert('Error', 'Enter a complaint ID');
    setLoading(true); setComplaint(null);
    try {
      const { data } = await complaintsAPI.track(id.trim());
      setComplaint(data.data.complaint);
    } catch (err) {
      Alert.alert('Not Found', err.response?.data?.message || 'Complaint not found');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
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
        <Text style={globalStyles.heading}>Track Complaint</Text>
        <Text style={[globalStyles.subheading, { marginBottom: 20 }]}>No login required</Text>

        {/* Search */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Complaint ID</Text>
          <TextInput style={globalStyles.input} placeholder="CC-202504-000001"
            placeholderTextColor={colors.muted} value={id} onChangeText={setId}
            autoCapitalize="characters" autoCorrect={false}
            onSubmitEditing={track} returnKeyType="search" />
          <TouchableOpacity style={globalStyles.btnPrimary} onPress={track} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={globalStyles.btnPrimaryText}>Track →</Text>}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {complaint && (
          <>
            <View style={globalStyles.card}>
              <Text style={{ fontFamily: 'monospace', fontSize: 11, color: colors.electric, marginBottom: 6 }}>
                {complaint.complaintId}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                {complaint.title}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                <View style={[globalStyles.badge, { backgroundColor: `${statusColors[complaint.status] || colors.muted}20` }]}>
                  <Text style={{ color: statusColors[complaint.status] || colors.muted, fontSize: 12, fontWeight: '700' }}>
                    {complaint.status.replace(/_/g,' ').toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
                  {complaint.category?.replace(/_/g,' ')} • {complaint.severity}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={globalStyles.card}>
              <Text style={globalStyles.sectionTitle}>Case Timeline</Text>
              {(complaint.timeline || []).map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: i === (complaint.timeline.length - 1)
                        ? statusColors[t.status] || colors.electric
                        : 'rgba(0,180,255,0.1)',
                      borderWidth: 2,
                      borderColor: statusColors[t.status] || colors.electric,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 11 }}>
                        {t.status === 'resolved' ? '✓' : t.status === 'pending' ? '⏳' : '●'}
                      </Text>
                    </View>
                    {i < complaint.timeline.length - 1 && (
                      <View style={{ width: 2, flex: 1, backgroundColor: 'rgba(0,180,255,0.15)', marginTop: 4 }} />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingTop: 4 }}>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
                      {t.message}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      {format(new Date(t.timestamp), 'dd MMM yyyy, hh:mm a')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
