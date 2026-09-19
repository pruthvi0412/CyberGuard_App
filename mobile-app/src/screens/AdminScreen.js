import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { complaintsAPI } from '../services/api';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles, statusColors, severityColors } from '../utils/theme';
import { format } from 'date-fns';
import CyberBackground from '../components/CyberBackground';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../hooks/useAuthStore';

const STATUSES = ['pending', 'under_review', 'investigating', 'resolved', 'rejected'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function AdminScreen({ navigation }) {
  const { user } = useAuthStore();
  const isAdminUser = user?.role === 'admin';
  const [overview,   setOverview]   = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAdminComplaints = async () => {
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

      // Step 2: Admin-only system metrics. Officers may use the shared
      // analytics and complaint-status capabilities above, but not /admin/*.
      if (isAdminUser) {
        try {
          const [hlRes, mlRes] = await Promise.all([
            adminAPI.systemStats(),
            adminAPI.mlStatus()
          ]);
          setHealth(hlRes.data?.data?.health || health);
          setMlStatus(mlRes.data?.data || null);
        } catch (e) {
          console.log('Admin system metrics unavailable');
        }
      }
      
    } catch (e) {
      console.error('Unexpected Admin Fetch Error:', e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [isAdminUser])
  );

  const openTriageModal = (item) => {
    setSelectedComp(item);
    setStatus(item.status || 'pending');
    setSeverity(item.severity || 'medium');
    setNotes('');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedComp) return;
    setUpdating(true);
    try {
      await complaintsAPI.updateStatus(selectedComp._id, {
        status,
        message: notes.trim() || `Status updated to ${status} by triage officer`,
      });

      if (severity !== selectedComp.severity) {
        await complaintsAPI.updatePriority(selectedComp._id, { priority: severity });
      }

      Alert.alert('Triage Saved', `Case ${selectedComp.complaintId || selectedComp._id} updated successfully.`);
      setModalVisible(false);
      fetchAdminComplaints();
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Could not update case triage.');
    } finally {
      setUpdating(false);
    }
  };

  const renderComplaintItem = ({ item }) => {
    const statusColor = statusColors[item.status] || colors.cyber;
    const severityColor = severityColors[item.severity] || colors.warn;

    return (
      <View style={globalStyles.glassCard}>
        <View style={globalStyles.spaceBetween}>
          <Text style={[globalStyles.mono, { color: colors.cyber, fontSize: 11, fontWeight: '800' }]}>
            {item.complaintId || item._id?.substring(0, 10)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={[globalStyles.badge, { backgroundColor: `${statusColor}20`, borderColor: statusColor, borderWidth: 1 }]}>
              <Text style={{ color: statusColor, fontSize: 9, fontWeight: '900' }}>
                {(item.status || 'pending').replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
            <View style={[globalStyles.badge, { backgroundColor: `${severityColor}20`, borderColor: severityColor, borderWidth: 1 }]}>
              <Text style={{ color: severityColor, fontSize: 9, fontWeight: '900' }}>
                {(item.severity || 'medium').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[globalStyles.btnOutline, { flex: 1, paddingVertical: 8 }]}
            onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item._id || item.complaintId })}
          >
            <Text style={[globalStyles.btnOutlineText, { fontSize: 11 }]}>View Dossier</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.triageBtn, { flex: 1 }]}
            onPress={() => openTriageModal(item)}
          >
            <Text style={styles.triageBtnText}>⚡ Triage & Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <CyberBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '900' }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>OFFICER COMMAND & TRIAGE</Text>
          <Text style={styles.headerSub}>CASE MANAGEMENT & INCIDENT RESOLUTION</Text>
        </View>
      </View>

            {/* System Protocols are admin-only placeholders until backed by APIs. */}
            {isAdminUser && (
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
            )}

            {/* Neural Engine & Health are backed by admin-only endpoints. */}
            {isAdminUser && <View style={{ flexDirection: 'row', gap: 15, marginVertical: 20 }}>
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
            </View>}

            <Text style={{ color: colors.cyber, fontSize: 11, fontWeight: '800', marginTop: 4, fontFamily: 'monospace' }}>
              {selectedComp?.complaintId}
            </Text>

            {/* Status Selector */}
            <Text style={[globalStyles.label, { marginTop: 14 }]}>UPDATE INVESTIGATION STATUS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {STATUSES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusChip, status === s && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.statusChipText, status === s && { color: '#030A14' }]}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Severity Selector */}
            <Text style={[globalStyles.label, { marginTop: 14 }]}>THREAT SEVERITY</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {SEVERITIES.map(sev => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.statusChip, severity === sev && { backgroundColor: colors.warn, borderColor: colors.warn }]}
                  onPress={() => setSeverity(sev)}
                >
                  <Text style={[styles.statusChipText, severity === sev && { color: '#030A14' }]}>
                    {sev.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Officer Note */}
            <Text style={[globalStyles.label, { marginTop: 14 }]}>OFFICER REMARK / TIMELINE NOTE</Text>
            <TextInput
              style={[globalStyles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="e.g. Account freeze request sent to nodal bank..."
              placeholderTextColor={colors.muted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity 
              style={[globalStyles.btnPrimary, { marginTop: 14 }]}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#030A14" />
              ) : (
                <Text style={globalStyles.btnPrimaryText}>SAVE CASE UPDATES</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 255, 209, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 209, 0.3)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  headerSub: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  triageBtn: {
    backgroundColor: 'rgba(0, 255, 209, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 209, 0.4)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triageBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
  },
  statusChip: {
    backgroundColor: 'rgba(0, 180, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipText: {
    color: colors.cyber,
    fontSize: 10,
    fontWeight: '800',
  }
});
