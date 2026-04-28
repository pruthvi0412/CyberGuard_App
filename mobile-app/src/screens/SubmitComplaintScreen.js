import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { complaintsAPI } from '../services/api';
import { colors, globalStyles } from '../utils/theme';

const STEPS = ['Details', 'Victim Info', 'Evidence', 'Submit'];

export default function SubmitComplaintScreen({ navigation }) {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [files,   setFiles]   = useState([]);
  const [form,    setForm]    = useState({
    title: '', description: '', incidentDate: new Date().toISOString().split('T')[0],
    financialLoss: '', lossType: 'none', state: '', district: '',
    suspectEmail: '', suspectPhone: '', isAnonymous: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickFile = async () => {
    if (files.length >= 5) return Alert.alert('Limit reached', 'Maximum 5 files allowed');
    const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.[0]) {
      setFiles(prev => [...prev, result.assets[0]]);
    }
  };

  const validate = () => {
    if (step === 0) {
      if (!form.title || form.title.length < 10) { Alert.alert('Error', 'Title needs at least 10 characters'); return false; }
      if (!form.description || form.description.length < 50) { Alert.alert('Error', 'Description needs at least 50 characters'); return false; }
      if (!form.incidentDate) { Alert.alert('Error', 'Incident date is required'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('source',      'mobile');
      fd.append('isAnonymous', String(form.isAnonymous));
      fd.append('victimDetails', JSON.stringify({
        financialLoss: parseFloat(form.financialLoss) || 0,
        lossType:      form.lossType,
        incidentDate:  form.incidentDate,
      }));
      fd.append('suspectInfo', JSON.stringify({
        email: form.suspectEmail, phone: form.suspectPhone,
      }));
      fd.append('location', JSON.stringify({ state: form.state, district: form.district }));
      files.forEach(f => {
        fd.append('evidence', { uri: f.uri, name: f.name, type: f.mimeType || 'application/octet-stream' });
      });

      const { data } = await complaintsAPI.create(fd);
      Alert.alert('Success! 🎉',
        `Complaint ${data.data.complaint.complaintId} submitted.\nAI Classification: ${data.data.complaint.category?.replace(/_/g,' ')}`,
        [{ text: 'View Complaints', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err) {
      Alert.alert('Submission Failed', err.response?.data?.message || 'Please try again');
    } finally { setLoading(false); }
  };

  const Field = ({ k, label, ...props }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={globalStyles.label}>{label}</Text>
      <TextInput style={globalStyles.input} placeholderTextColor={colors.muted}
        value={form[k]} onChangeText={v => set(k, v)} {...props} />
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Step indicator */}
        <View style={{ flexDirection: 'row', padding: 16, gap: 6 }}>
          {STEPS.map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ height: 3, width: '100%', borderRadius: 2,
                backgroundColor: i <= step ? colors.electric : 'rgba(0,180,255,0.15)' }} />
              <Text style={{ fontSize: 9, color: i === step ? colors.electric : colors.muted,
                marginTop: 4, fontWeight: '700' }}>{s}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

          {step === 0 && (
            <View>
              <Text style={globalStyles.sectionTitle}>Incident Details</Text>
              <Field k="title" label="Complaint Title *" placeholder="Brief title (min 10 chars)" />
              <Text style={globalStyles.label}>Description * (min 50 chars)</Text>
              <TextInput style={[globalStyles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholderTextColor={colors.muted} multiline
                placeholder="Describe exactly what happened…"
                value={form.description} onChangeText={v => set('description', v)} />
              <Text style={{ color: form.description.length >= 50 ? colors.success : colors.muted,
                fontSize: 11, marginBottom: 12 }}>
                {form.description.length}/50 minimum characters
              </Text>
              <Field k="incidentDate" label="Incident Date (YYYY-MM-DD) *" placeholder="2024-01-01" />
              <TouchableOpacity
                onPress={() => set('isAnonymous', !form.isAnonymous)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <View style={{ width: 20, height: 20, borderRadius: 4,
                  borderWidth: 1, borderColor: colors.electric,
                  backgroundColor: form.isAnonymous ? colors.electric : 'transparent',
                  alignItems: 'center', justifyContent: 'center' }}>
                  {form.isAnonymous && <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text>}
                </View>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Submit anonymously</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={globalStyles.sectionTitle}>Victim & Location</Text>
              <Field k="financialLoss" label="Financial Loss (₹)" placeholder="0" keyboardType="numeric" />
              <Field k="state"         label="Your State"          placeholder="Maharashtra" />
              <Field k="district"      label="Your District"       placeholder="Mumbai" />
              <Text style={[globalStyles.sectionTitle, { marginTop: 8 }]}>Suspect Info (Optional)</Text>
              <Field k="suspectEmail" label="Suspect Email" placeholder="If known" keyboardType="email-address" />
              <Field k="suspectPhone" label="Suspect Phone" placeholder="If known" keyboardType="phone-pad" />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={globalStyles.sectionTitle}>Upload Evidence</Text>
              <TouchableOpacity onPress={pickFile} style={{
                borderWidth: 2, borderColor: 'rgba(0,180,255,0.3)', borderStyle: 'dashed',
                borderRadius: 10, padding: 32, alignItems: 'center', marginBottom: 16,
              }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📎</Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Tap to attach evidence</Text>
                <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                  Images, PDF, Video — max 5 files
                </Text>
              </TouchableOpacity>
              {files.map((f, i) => (
                <View key={i} style={[globalStyles.card, { flexDirection: 'row', justifyContent: 'space-between', padding: 12 }]}>
                  <Text style={{ color: colors.text, fontSize: 12, flex: 1 }} numberOfLines={1}>📄 {f.name}</Text>
                  <TouchableOpacity onPress={() => setFiles(prev => prev.filter((_,j) => j !== i))}>
                    <Text style={{ color: colors.danger, fontSize: 16, marginLeft: 8 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {files.length === 0 && (
                <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>
                  No files selected — evidence is optional
                </Text>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={globalStyles.sectionTitle}>Review & Submit</Text>
              {[
                ['Title',         form.title],
                ['Date',          form.incidentDate],
                ['Financial Loss',form.financialLoss ? `₹${form.financialLoss}` : 'None'],
                ['State',         form.state || 'Not specified'],
                ['Files',         `${files.length} attached`],
                ['Anonymous',     form.isAnonymous ? 'Yes' : 'No'],
              ].map(([label, val]) => (
                <View key={label} style={{ flexDirection: 'row', paddingVertical: 10,
                  borderBottomWidth: 1, borderBottomColor: 'rgba(0,180,255,0.08)' }}>
                  <Text style={{ color: colors.muted, fontSize: 13, width: 110 }}>{label}</Text>
                  <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{val || '—'}</Text>
                </View>
              ))}
              <View style={{ marginTop: 16, padding: 12, borderRadius: 8,
                backgroundColor: 'rgba(0,255,209,0.05)', borderWidth: 1,
                borderColor: 'rgba(0,255,209,0.2)' }}>
                <Text style={{ color: colors.accent, fontSize: 12 }}>
                  🤖 AI will auto-classify this complaint and notify you of updates
                </Text>
              </View>
            </View>
          )}

          {/* Navigation buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity style={[globalStyles.btnOutline, { flex: 1 }]}
              onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}>
              <Text style={globalStyles.btnOutlineText}>{step === 0 ? 'Cancel' : '← Back'}</Text>
            </TouchableOpacity>
            {step < STEPS.length - 1 ? (
              <TouchableOpacity style={[globalStyles.btnPrimary, { flex: 1 }]}
                onPress={() => validate() && setStep(s => s + 1)}>
                <Text style={globalStyles.btnPrimaryText}>Next →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[globalStyles.btnPrimary, { flex: 1 }]}
                onPress={handleSubmit} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={globalStyles.btnPrimaryText}>🚀 Submit</Text>}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
