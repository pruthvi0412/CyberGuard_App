import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { complaintsAPI } from '../services/api';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles, statusColors } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await complaintsAPI.getAll({ limit: 30 });
      setComplaints(data.data.complaints);
    } catch { Alert.alert('Error', 'Could not load complaints'); }
    finally  { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchComplaints(); }, []);

  const stats = [
    { label: 'Total',    value: complaints.length,                                                     color: colors.electric },
    { label: 'Pending',  value: complaints.filter(c => c.status === 'pending').length,                 color: '#FFD600' },
    { label: 'Active',   value: complaints.filter(c => ['under_review','investigating'].includes(c.status)).length, color: colors.warn },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length,                color: colors.success },
  ];

  const renderComplaint = ({ item: c }) => (
    <TouchableOpacity style={globalStyles.card}
      onPress={() => navigation.navigate('ComplaintDetail', { complaintId: c.complaintId })}>
      <View style={globalStyles.spaceBetween}>
        <Text style={{ fontFamily: 'monospace', fontSize: 10, color: colors.electric }}>{c.complaintId}</Text>
        <View style={[globalStyles.badge, { backgroundColor: `${statusColors[c.status]}20` }]}>
          <Text style={{ color: statusColors[c.status] || colors.muted, fontSize: 10, fontWeight: '700' }}>
            {c.status.replace(/_/g,' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginVertical: 6 }} numberOfLines={2}>
        {c.title}
      </Text>
      <View style={globalStyles.row}>
        <Text style={{ color: colors.muted, fontSize: 11, flex: 1 }}>
          {c.category?.replace(/_/g,' ')} • {format(new Date(c.createdAt), 'dd MMM yyyy')}
        </Text>
        {c.mlPrediction?.confidence && (
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>
            AI {(c.mlPrediction.confidence * 100).toFixed(0)}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.screen}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        {/* Header */}
        <View style={[globalStyles.spaceBetween, { marginBottom: 20 }]}>
          <View>
            <Text style={globalStyles.heading}>My Complaints</Text>
            <Text style={globalStyles.subheading}>Welcome, {user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
          ])} style={{ padding: 8 }}>
            <Text style={{ fontSize: 22 }}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {stats.map((s, i) => (
            <View key={i} style={[globalStyles.card, { flex: 1, padding: 12, marginBottom: 0, alignItems: 'center' }]}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.electric }}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={c => c._id}
          renderItem={renderComplaint}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} tintColor={colors.electric}
              onRefresh={() => { setRefreshing(true); fetchComplaints(); }} />
          }
          ListEmptyComponent={
            <View style={[globalStyles.card, { alignItems: 'center', padding: 40 }]}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
              <Text style={{ color: colors.muted, marginBottom: 16 }}>No complaints filed yet</Text>
              <TouchableOpacity style={globalStyles.btnPrimary}
                onPress={() => navigation.navigate('Submit')}
                style={{ backgroundColor: colors.cyber, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 }}>
                <Text style={globalStyles.btnPrimaryText}>File First Complaint</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
