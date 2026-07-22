import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { complaintsAPI } from '../services/api';
import { colors, globalStyles, statusColors } from '../utils/theme';
import { format } from 'date-fns';

export default function ComplaintDetailScreen({ route }) {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const request = /^[0-9a-fA-F]{24}$/.test(complaintId) 
      ? complaintsAPI.getOne(complaintId)
      : complaintsAPI.track(complaintId);

    request
      .then(({ data }) => {
        setComplaint(data.data.complaint);
      })
      .catch((err) => {
        console.error('Load Error:', err.response?.data || err.message);
        Alert.alert('Error', 'Could not load complaint details.');
      })
      .finally(() => setLoading(false));
  }, [complaintId]);

  if (loading) return (
    <View style={[globalStyles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: colors.electric }}>Loading…</Text>
    </View>
  );

  if (!complaint) return (
    <View style={[globalStyles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: colors.muted }}>Complaint not found</Text>
    </View>
  );

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
      <ScrollView style={globalStyles.screen} contentContainerStyle={{ padding: 20 }}>
      <View style={globalStyles.card}>
        <Text style={{ fontFamily: 'monospace', fontSize: 11, color: colors.electric, marginBottom: 6 }}>
          {complaint.complaintId}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
          {complaint.title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <View style={[globalStyles.badge, { backgroundColor: `${statusColors[complaint.status] || colors.muted}20`, borderColor: statusColors[complaint.status] || colors.muted, borderWidth: 1 }]}>
            <Text style={{ color: statusColors[complaint.status] || colors.muted, fontSize: 11, fontWeight: '700' }}>
              {(complaint.status || 'pending').replace(/_/g,' ').toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
            {complaint.category?.replace(/_/g,' ')}
          </Text>
        </View>
      </View>

      {complaint.mlPrediction && (
        <View style={[globalStyles.card, { backgroundColor: 'rgba(0,255,209,0.05)', borderColor: 'rgba(0,255,209,0.2)' }]}>
          <Text style={globalStyles.sectionTitle}>AI Classification</Text>
          <Text style={{ color: colors.text, fontSize: 13 }}>
            Category: <Text style={{ color: colors.accent }}>{complaint.mlPrediction.category?.replace(/_/g,' ')}</Text>
          </Text>
          <Text style={{ color: colors.text, fontSize: 13, marginTop: 4 }}>
            Confidence: <Text style={{ color: colors.accent }}>{(complaint.mlPrediction.confidence * 100).toFixed(1)}%</Text>
          </Text>
        </View>
      )}

      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Timeline</Text>
        {(complaint.timeline || []).map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12,
              backgroundColor: `${statusColors[t.status] || colors.electric}20`,
              borderWidth: 2, borderColor: statusColors[t.status] || colors.electric,
              alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: 10 }}>{t.status === 'resolved' ? '✓' : '●'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{t.message}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                {format(new Date(t.timestamp), 'dd MMM yyyy, hh:mm a')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
