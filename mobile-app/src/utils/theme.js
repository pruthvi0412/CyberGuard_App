import { StyleSheet, Platform } from 'react-native';

export const colors = {
  navy:     '#0A0F1E',
  card:     'rgba(12, 20, 40, 0.8)',
  cyber:    '#00B4FF',
  electric: '#00B4FF',
  accent:   '#00FFD1',
  warn:     '#FF6B35',
  success:  '#00C896',
  danger:   '#FF5252',
  text:     '#E0E8FF',
  muted:    '#5A6480',
  border:   'rgba(0,180,255,0.2)',
  glass:    'rgba(255, 255, 255, 0.05)',
  neonBlue: '#00B4FF',
  neonCyan: '#00FFD1',
};

export const globalStyles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: colors.navy 
  },
  glassCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.15)',
    shadowColor: colors.electric,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    backgroundColor: 'rgba(12, 20, 40, 0.6)',
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
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  label: { 
    fontSize: 10, 
    color: colors.accent, 
    marginBottom: 8, 
    fontWeight: '800', 
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  btnPrimary: {
    backgroundColor: colors.electric,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.electric,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  btnPrimaryText: { 
    color: '#0A0F1E', 
    fontSize: 14, 
    fontWeight: '900',
    letterSpacing: 1
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.electric,
  },
  btnOutlineText: { 
    color: colors.electric, 
    fontSize: 14, 
    fontWeight: '700' 
  },
  heading: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: 6,
    letterSpacing: 1,
  },
  subheading: { 
    fontSize: 13, 
    color: colors.muted,
    lineHeight: 18,
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 6,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  spaceBetween: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  sectionTitle: { 
    fontSize: 11, 
    color: colors.accent, 
    fontWeight: '900',
    letterSpacing: 3, 
    textTransform: 'uppercase', 
    marginBottom: 15 
  },
  errorText: { 
    color: colors.warn, 
    fontSize: 12, 
    marginTop: -12, 
    marginBottom: 12 
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  }
});

export const statusColors = {
  pending:      '#FFD600',
  under_review: '#00B4FF',
  investigating:'#FF6B35',
  resolved:     '#00C896',
  closed:       '#5A6480',
  rejected:     '#FF5252',
};

