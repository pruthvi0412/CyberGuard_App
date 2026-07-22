import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyticsAPI, complaintsAPI } from '../services/api';
import { colors, globalStyles, statusColors } from '../utils/theme';
import { format } from 'date-fns';
import CyberBackground from '../components/CyberBackground';
import { useFocusEffect } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function AdminScreen({ navigation }) {
  const [overview,   setOverview]   = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [health,     setHealth]     = useState({ cpu: 0, memory: 0, storage: 0, uptime: 0 });
  const [mlStatus,   setMlStatus]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('overview');
  const [error,      setError]      = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    setError(false);
    try {
      // Step 1: Priority Core Data
      const [ovRes, clRes] = await Promise.allSettled([
        analyticsAPI.overview(),
        complaintsAPI.getAll({ limit: 50 })
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data?.data?.overview || null);
      if (clRes.status === 'fulfilled') setComplaints(clRes.value.data?.data?.complaints || []);
      
      if (ovRes.status === 'rejected' && clRes.status === 'rejected') {
        setError(true);
      }

      // Step 2: System Metrics (Non-blocking)
      try {
        const [hlRes, mlRes] = await Promise.all([
          adminAPI.systemStats(),
          adminAPI.mlStatus()
        ]);
        setHealth(hlRes.data?.data?.health || health);
        setMlStatus(mlRes.data?.data || null);
      } catch (e) {
        console.log('System metrics sync deferred or restricted');
      }
      
    } catch (e) {
      console.error('Unexpected Admin Fetch Error:', e);
      setError(true);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleAction = (name) => {
    Alert.alert('Protocol Execution', `Initiating ${name} sequence...`, [
      { text: 'CONFIRM', onPress: () => Alert.alert('Success', `${name} completed. Logs updated.`) },
      { text: 'ABORT', style: 'cancel' }
    ]);
  };

  const handleStatusUpdate = (complaint) => {
    Alert.alert('System Protocol', 'Change incident status?', [
      ...['pending','under_review','investigating','resolved','closed','rejected'].map(s => ({
        text: s.replace(/_/g,' ').toUpperCase(),
        onPress: async () => {
          try {
            await complaintsAPI.updateStatus(complaint._id, { status: s });
            fetchData();
          } catch { Alert.alert('Error', 'Protocol update failed'); }
        }
      })),
      { text: 'ABORT', style: 'cancel' },
    ]);
  };

  const statItems = [
    { label: 'LIVE CASES',    value: overview?.totalComplaints || '...',   color: colors.electric, icon: '📂' },
    { label: 'CRITICAL',      value: overview?.criticalComplaints || '...', color: colors.danger,   icon: '🚨' },
    { label: 'UPTIME',        value: '99.9%',                   color: colors.success,  icon: '🌐' },
    { label: 'ACCURACY',      value: '97.4%',                   color: '#9C27B0',       icon: '🧠' },
  ];

  return (
    <SafeAreaView style={[globalStyles.screen, { backgroundColor: '#0A0F1E' }]}>
      <CyberBackground />
      
      {/* Back Navigation */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10, zIndex: 100 }}>
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

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.electric} onRefresh={fetchData} />}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(0,180,255,0.15)', borderRadius: 4 }}>
              <Text style={{ color: colors.electric, fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>SYSTEM LEVEL 4</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: error ? colors.danger : colors.success }} />
              <Text style={{ color: colors.muted, fontSize: 10 }}>{error ? 'OFFLINE' : 'SYNC: ACTIVE'}</Text>
            </View>
          </View>
          <Text style={styles.title}>COMMAND CENTER</Text>
          <Text style={styles.subtitle}>SECURE SECTOR 01 • REAL-TIME MONITORING</Text>
        </View>

        {error && (
          <View style={[styles.metricsCard, { borderColor: colors.danger, backgroundColor: 'rgba(255,82,82,0.05)' }]}>
            <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center', fontSize: 12 }}>SYNC ERROR 503: NEURAL LINK TIMEOUT</Text>
            <TouchableOpacity onPress={fetchData} style={[globalStyles.btnPrimary, { marginTop: 15, backgroundColor: colors.danger }]}>
              <Text style={globalStyles.btnPrimaryText}>RETRY PROTOCOL</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          {['OVERVIEW','COMPLAINTS'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t.toLowerCase())} style={[
              styles.tab,
              tab === t.toLowerCase() && styles.activeTab
            ]}>
              <Text style={[
                styles.tabText,
                tab === t.toLowerCase() && styles.activeTabText
              ]}>{t}</Text>
              {tab === t.toLowerCase() && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' && (
          <View style={{ marginTop: 10 }}>
            {/* Stat Cards */}
            <View style={styles.statsGrid}>
              {statItems.map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* System Protocols */}
            <View style={styles.metricsCard}>
              <Text style={[globalStyles.sectionTitle, { color: colors.electric, fontSize: 11, marginBottom: 15 }]}>SYSTEM PROTOCOLS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { label: 'AUDIT',    color: colors.electric, icon: '🔍' },
                  { label: 'ALERT',    color: colors.accent,   icon: '📢' },
                  { label: 'OPTIMIZE', color: '#FFD600',       icon: '⚡' },
                  { label: 'PURGE',    color: colors.danger,   icon: '🗑️' }
                ].map(p => (
                  <TouchableOpacity 
                    key={p.label} 
                    onPress={() => handleAction(p.label)}
                    style={[styles.protocolBtn, { borderColor: `${p.color}40` }]}
                  >
                    <Text style={{ fontSize: 14, marginBottom: 4 }}>{p.icon}</Text>
                    <Text style={[styles.protocolText, { color: p.color }]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Neural Engine & Health */}
            <View style={{ flexDirection: 'row', gap: 15, marginVertical: 20 }}>
              <View style={[styles.statCard, { flex: 1, borderColor: 'rgba(156, 39, 176, 0.3)' }]}>
                <Text style={[globalStyles.sectionTitle, { color: '#9C27B0', fontSize: 10, marginBottom: 10 }]}>NEURAL ENGINE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, shadowColor: colors.success, shadowRadius: 5, shadowOpacity: 1 }} />
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>ONLINE</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 9 }}>Accuracy: 97.4%</Text>
                <Text style={{ color: colors.muted, fontSize: 9, marginTop: 4 }}>Models: 4 Active</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <Text style={[globalStyles.sectionTitle, { color: '#fff', fontSize: 10, marginBottom: 10 }]}>SYSTEM HEALTH</Text>
                {[
                  { label: 'CPU', val: health.cpu, color: colors.accent },
                  { label: 'MEM', val: health.memory, color: '#FFD600' },
                  { label: 'DSK', val: health.storage, color: colors.electric }
                ].map(h => (
                  <View key={h.label} style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ color: colors.muted, fontSize: 8, fontWeight: '700' }}>{h.label}</Text>
                      <Text style={{ color: '#fff', fontSize: 8 }}>{Math.round(h.val)}%</Text>
                    </View>
                    <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <View style={{ width: `${h.val}%`, height: '100%', backgroundColor: h.color, borderRadius: 2 }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Incident Stream */}
            <View style={styles.metricsCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={[globalStyles.sectionTitle, { color: colors.accent, fontSize: 11, margin: 0 }]}>INCIDENT STREAM</Text>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} />
              </View>
              {complaints.slice(0, 5).map((c, i) => (
                <View key={c._id} style={{ 
                  padding: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8, 
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', marginBottom: 8 
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: colors.electric, fontSize: 9, fontWeight: '800' }}>{c.complaintId}</Text>
                    <Text style={{ color: c.severity === 'high' ? colors.danger : colors.muted, fontSize: 8, textTransform: 'uppercase' }}>{c.severity}</Text>
                  </View>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>{c.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === 'complaints' && (
          <View style={{ marginTop: 10 }}>
            {complaints.length === 0 && !refreshing ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40, marginBottom: 15 }}>📡</Text>
                <Text style={styles.emptyTitle}>NO ACTIVE SIGNALS</Text>
                <Text style={styles.emptySub}>The registry is currently synchronized and clear.</Text>
              </View>
            ) : (
              complaints.map(c => (
                <TouchableOpacity 
                  key={c._id} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ComplaintDetail', { complaintId: c._id })}
                  style={styles.complaintCard}
                >
                  <View style={globalStyles.spaceBetween}>
                    <Text style={[globalStyles.mono, { color: colors.electric, fontSize: 10 }]}>{c.complaintId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColors[c.status] || colors.muted}20`, borderColor: statusColors[c.status] || colors.muted, borderWidth: 1 }]}>
                      <Text style={[styles.statusText, { color: statusColors[c.status] || colors.muted }]}>
                        {(c.status || 'pending').replace(/_/g,' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.complaintTitle} numberOfLines={2}>{c.title}</Text>
                  
                  <View style={styles.complaintFooter}>
                    <Text style={styles.footerInfo}>
                      {c.userId?.name || 'EXTERNAL SOURCE'} • {format(new Date(c.createdAt), 'dd MMM yyyy')}
                    </Text>
                    <TouchableOpacity onPress={() => handleStatusUpdate(c)} style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>UPDATE STATUS</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 180, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 1,
  },
  activeTabText: {
    color: colors.electric,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '40%',
    height: 2,
    backgroundColor: colors.electric,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(12, 20, 40, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 8,
    color: colors.muted,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  metricsCard: {
    backgroundColor: 'rgba(12, 20, 40, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.1)',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 12,
    color: colors.electric,
    fontWeight: '800',
  },
  protocolBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  complaintCard: {
    backgroundColor: 'rgba(12, 20, 40, 0.8)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  complaintTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 12,
    lineHeight: 20,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  footerInfo: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  actionBtn: {
    backgroundColor: 'rgba(0, 180, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.3)',
  },
  actionBtnText: {
    color: colors.electric,
    fontSize: 9,
    fontWeight: '800',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(12, 20, 40, 0.4)',
    borderRadius: 20,
    marginTop: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  emptySub: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  }
});
