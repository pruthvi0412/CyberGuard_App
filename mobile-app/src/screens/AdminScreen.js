// ─── AdminScreen.js ───────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyticsAPI, complaintsAPI } from '../services/api';
import { colors, globalStyles, statusColors } from '../utils/theme';
import { format } from 'date-fns';

export function AdminScreen() {
  const [overview,   setOverview]   = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('overview');

  const fetchData = async () => {
    try {
      const [ov, cl] = await Promise.all([
        analyticsAPI.overview(),
        complaintsAPI.getAll({ limit: 20 }),
      ]);
      setOverview(ov.data.data.overview);
      setComplaints(cl.data.data.complaints);
    } catch {}
    finally { setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = (complaint) => {
    Alert.prompt
      ? Alert.prompt('Update Status', 'Enter new status:', async (status) => {
          if (!status) return;
          try {
            await complaintsAPI.updateStatus(complaint._id, { status: status.toLowerCase().replace(' ','_') });
            fetchData();
            Alert.alert('Updated', 'Status updated successfully');
          } catch { Alert.alert('Error', 'Update failed'); }
        })
      : Alert.alert('Update Status', 'Select new status', [
          ...['pending','under_review','investigating','resolved','closed','rejected'].map(s => ({
            text: s.replace(/_/g,' '),
            onPress: async () => {
              try {
                await complaintsAPI.updateStatus(complaint._id, { status: s });
                fetchData();
              } catch { Alert.alert('Error', 'Update failed'); }
            }
          })),
          { text: 'Cancel', style: 'cancel' },
        ]);
  };

  const statItems = overview ? [
    { label: 'Total',    value: overview.totalComplaints,   color: colors.electric },
    { label: 'Pending',  value: overview.pendingComplaints, color: '#FFD600' },
    { label: 'Resolved', value: overview.resolvedComplaints,color: colors.success },
    { label: 'Critical', value: overview.criticalComplaints,color: colors.warn },
  ] : [];

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.electric}
          onRefresh={() => { setRefreshing(true); fetchData(); }} />}>

        <Text style={globalStyles.heading}>Admin Panel</Text>
        <Text style={[globalStyles.subheading, { marginBottom: 20 }]}>System overview & management</Text>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {['overview','complaints'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{
              flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
              backgroundColor: tab === t ? colors.cyber : 'rgba(0,180,255,0.05)',
              borderWidth: 1, borderColor: tab === t ? colors.electric : colors.border,
            }}>
              <Text style={{ color: tab === t ? '#fff' : colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' && overview && (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {statItems.map((s, i) => (
                <View key={i} style={[globalStyles.card, { flex: 1, minWidth: '45%', alignItems: 'center', padding: 16, marginBottom: 0 }]}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: s.color }}>{s.value}</Text>
                  <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{s.label}</Text>
                </View>
              ))}
            </View>
            <View style={globalStyles.card}>
              <Text style={globalStyles.sectionTitle}>Key Metrics</Text>
              {[
                ['Resolution Rate', `${overview.resolutionRate}%`],
                ['Avg Resolution',  `${overview.avgResolutionDays} days`],
                ['This Month',      `${overview.thisMonthComplaints} complaints`],
                ['Growth',          `${overview.growthRate > 0 ? '+' : ''}${overview.growthRate}%`],
              ].map(([label, val]) => (
                <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between',
                  paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,180,255,0.08)' }}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
                  <Text style={{ color: colors.electric, fontSize: 13, fontWeight: '700' }}>{val}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'complaints' && (
          <>
            {complaints.map(c => (
              <View key={c._id} style={globalStyles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'monospace', fontSize: 10, color: colors.electric }}>{c.complaintId}</Text>
                  <View style={[globalStyles.badge, { backgroundColor: `${statusColors[c.status]}20` }]}>
                    <Text style={{ color: statusColors[c.status], fontSize: 10, fontWeight: '700' }}>
                      {c.status.replace(/_/g,' ')}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 6 }} numberOfLines={2}>
                  {c.title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 10 }}>
                  {c.userId?.name || 'Anonymous'} • {format(new Date(c.createdAt), 'dd MMM yyyy')}
                </Text>
                <TouchableOpacity onPress={() => handleStatusUpdate(c)}
                  style={{ backgroundColor: 'rgba(0,180,255,0.08)',
                    borderWidth: 1, borderColor: 'rgba(0,180,255,0.2)',
                    borderRadius: 6, paddingVertical: 6, alignItems: 'center' }}>
                  <Text style={{ color: colors.electric, fontSize: 12, fontWeight: '600' }}>Update Status</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ComplaintDetailScreen.js ─────────────────────────────────────────────────
export function ComplaintDetailScreen({ route }) {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    complaintsAPI.track(complaintId)
      .then(({ data }) => setComplaint(data.data.complaint))
      .catch(() => Alert.alert('Error', 'Could not load complaint'))
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
    <ScrollView style={globalStyles.screen} contentContainerStyle={{ padding: 20 }}>
      <View style={globalStyles.card}>
        <Text style={{ fontFamily: 'monospace', fontSize: 11, color: colors.electric, marginBottom: 6 }}>
          {complaint.complaintId}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
          {complaint.title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <View style={[globalStyles.badge, { backgroundColor: `${statusColors[complaint.status]}20` }]}>
            <Text style={{ color: statusColors[complaint.status], fontSize: 11, fontWeight: '700' }}>
              {complaint.status.replace(/_/g,' ').toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
            {complaint.category?.replace(/_/g,' ')}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
            Severity: {complaint.severity}
          </Text>
        </View>
      </View>

      {/* ML prediction */}
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

      {/* Timeline */}
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

// ─── ProfileScreen.js ─────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, logout } = require('../hooks/useAuthStore').default.getState();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={globalStyles.heading}>Profile</Text>

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.cyber, alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: colors.electric }}>
            <Text style={{ fontSize: 32, color: '#fff', fontWeight: '700' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 12 }}>{user?.name}</Text>
          <View style={{ backgroundColor: `${colors.electric}20`, borderRadius: 12, paddingHorizontal: 12,
            paddingVertical: 3, marginTop: 6 }}>
            <Text style={{ color: colors.electric, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.sectionTitle}>Account Details</Text>
          {[['Email', user?.email], ['Phone', user?.phone || 'Not set'], ['Role', user?.role]].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', paddingVertical: 10,
              borderBottomWidth: 1, borderBottomColor: 'rgba(0,180,255,0.08)' }}>
              <Text style={{ color: colors.muted, fontSize: 13, width: 80 }}>{label}</Text>
              <Text style={{ color: colors.text, fontSize: 13 }}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout}
          style={{ backgroundColor: 'rgba(255,82,82,0.1)', borderWidth: 1,
            borderColor: 'rgba(255,82,82,0.3)', borderRadius: 8,
            paddingVertical: 14, alignItems: 'center', marginTop: 12 }}>
          <Text style={{ color: '#FF5252', fontSize: 15, fontWeight: '700' }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AdminScreen;
