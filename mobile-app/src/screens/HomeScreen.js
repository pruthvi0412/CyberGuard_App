import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl,
  StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { complaintsAPI } from '../services/api';
import useAuthStore from '../hooks/useAuthStore';
import { colors, globalStyles, statusColors } from '../utils/theme';
import HeroSection from '../components/HeroSection';

export default function HomeScreen({ navigation }) {
  const { user, logout, isAdmin } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      // If admin, we can fetch all complaints. If user, we get our own.
      const { data } = await complaintsAPI.getAll({ limit: 50 });
      if (data?.status === 'success') {
        setComplaints(data.data.complaints || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      // Don't alert on every focus, but maybe on initial load
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const renderComplaint = (c) => (
    <TouchableOpacity key={c._id || c.complaintId} style={globalStyles.card}
      onPress={() => navigation.navigate('ComplaintDetail', { complaintId: c.complaintId })}>
      <View style={globalStyles.spaceBetween}>
        <Text style={[globalStyles.mono, { fontSize: 10, color: colors.electric }]}>{c.complaintId}</Text>
        <View style={[globalStyles.badge, { backgroundColor: `${statusColors[c.status] || colors.muted}20` }]}>
          <Text style={{ color: statusColors[c.status] || colors.muted, fontSize: 10, fontWeight: '800' }}>
            {(c.status || 'pending').replace(/_/g,' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginVertical: 8 }} numberOfLines={1}>
        {c.title}
      </Text>
      <View style={globalStyles.row}>
        <Text style={{ color: colors.muted, fontSize: 11, flex: 1 }}>
          {c.category || 'General'} • {c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : 'Recently'}
        </Text>
        {c.mlPrediction?.confidence > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginRight: 4 }} />
            <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800' }}>
              AI MATCH
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[globalStyles.screen, { backgroundColor: '#0A0F1E' }]} edges={['right', 'left']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={colors.electric}
            onRefresh={() => { setRefreshing(true); fetchComplaints(); }} />
        }
      >
        <HeroSection 
          navigation={navigation}
          onReportPress={() => navigation.navigate('Submit')} 
          onLoginPress={() => Alert.alert('Session', `Logged in as ${user?.name || 'User'}`)}
        />
        
        <View style={{ padding: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={globalStyles.sectionTitle}>Dashboard Feed</Text>
            <Text style={globalStyles.subheading}>
              {isAdmin() ? 'Global Incident Registry' : 'My Recent Activity'}
            </Text>
          </View>

          {loading && !refreshing ? (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <Text style={{ color: colors.electric, letterSpacing: 2, fontSize: 10, fontWeight: '800' }}>
                SYNCING DATA...
              </Text>
            </View>
          ) : (
            <View>
              {complaints && complaints.length > 0 ? (
                complaints.map(item => renderComplaint(item))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 48, marginBottom: 20 }}>🛰️</Text>
                  <Text style={styles.emptyTitle}>No Incidents Detected</Text>
                  <Text style={styles.emptyText}>
                    {isAdmin() ? 'The global registry is currently clear.' : 'You haven\'t filed any reports in this sector yet.'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Submit')}
                    style={styles.emptyBtn}>
                    <Text style={globalStyles.btnPrimaryText}>FILE FIRST COMPLAINT</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 180, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.2)',
  },
  emptyState: {
    backgroundColor: 'rgba(12, 20, 40, 0.5)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.1)',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1,
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 25,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  }
});


