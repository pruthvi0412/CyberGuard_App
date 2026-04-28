import { StyleSheet } from 'react-native';

export const colors = {
  navy:     '#0A0F1E',
  card:     '#0C1428',
  cyber:    '#0D47A1',
  electric: '#00B4FF',
  accent:   '#00FFD1',
  warn:     '#FF6B35',
  success:  '#00C896',
  danger:   '#FF5252',
  text:     '#E0E8FF',
  muted:    '#5A6480',
  border:   'rgba(0,180,255,0.2)',
};

export const globalStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  label: { fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: colors.cyber,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnOutline: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.electric,
  },
  btnOutlineText: { color: colors.electric, fontSize: 14, fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subheading: { fontSize: 13, color: colors.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  spaceBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 12, color: colors.electric, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  errorText: { color: colors.warn, fontSize: 12, marginTop: -10, marginBottom: 10 },
});

export const statusColors = {
  pending:      '#FFD600',
  under_review: '#00B4FF',
  investigating:'#FF6B35',
  resolved:     '#00C896',
  closed:       '#5A6480',
  rejected:     '#FF5252',
};
