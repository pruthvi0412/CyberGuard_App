import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, globalStyles } from '../utils/theme';
import CyberBackground from './CyberBackground';

const { width, height } = Dimensions.get('window');

export default function HeroSection({ onReportPress, onLoginPress, navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
  }, []);

  const navLinks = [
    { label: 'HOME',      target: 'Home' },
    { label: 'REPORT',    target: 'Submit' },
    { label: 'TRACK',     target: 'Track' },
    { label: 'DASHBOARD', target: 'Profile' },
    { label: 'ADMIN',     target: 'Admin' }
  ];

  const handleNav = (target) => {
    if (navigation) {
      navigation.navigate(target);
    }
  };

  return (
    <View style={styles.container}>
      <CyberBackground />

      {/* Full Web Navbar Mimic - Responsive Stack */}
      <View style={styles.navbar}>
        {/* Top Row: Logo & Auth */}
        <View style={styles.navTopRow}>
          <Text style={styles.logoText}>CRMS</Text>
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.getStartedBtn}>
              <Text style={styles.getStartedText}>GET STARTED</Text>
            </TouchableOpacity>
            <View style={styles.loginRow}>
              <TouchableOpacity onPress={onLoginPress} style={[styles.loginSmall, { backgroundColor: '#00FFD1' }]}>
                <Text style={styles.loginSmallText}>USER LOGIN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onLoginPress} style={[styles.loginSmall, { backgroundColor: '#00B4FF' }]}>
                <Text style={styles.loginSmallText}>ADMIN LOGIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Bottom Row: Navigation Links */}
        <View style={styles.navLinksRow}>
          {navLinks.map((item) => (
            <TouchableOpacity 
              key={item.label} 
              style={styles.navItem}
              onPress={() => handleNav(item.target)}
            >
              <Text style={styles.navItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hero Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.heroLine} />
        
        <View style={styles.titleContainer}>
          <Text style={styles.heroTitle}>REPORT.</Text>
          <Text style={styles.heroTitle}>TRACK.</Text>
          <Text style={styles.heroTitle}>PROTECT.</Text>
        </View>

        {/* Global Glow Sphere */}
        <View style={styles.sphereContainer}>
          <LinearGradient
            colors={['rgba(0, 255, 209, 0.2)', 'transparent']}
            style={styles.sphere}
          />
        </View>

        {/* Status Dashboard Row */}
        <View style={styles.dashboardContainer}>
          <View style={styles.dashItem}>
            <Text style={styles.dashLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.dashValue}>Operational</Text>
            </View>
          </View>
          <View style={styles.dashDivider} />
          <View style={styles.dashItem}>
            <Text style={styles.dashLabel}>NEURAL ENGINE</Text>
            <Text style={styles.dashValue}>ACTIVE</Text>
          </View>
          <View style={styles.dashDivider} />
          <View style={styles.dashItem}>
            <Text style={styles.dashLabel}>ACCURACY</Text>
            <Text style={styles.dashValue}>97.4%</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={onReportPress} style={styles.ctaWrapper}>
          <LinearGradient
            colors={['#00FFD1', '#00B4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>REPORT INCIDENT</Text>
          </LinearGradient>
          <View style={styles.ctaGlow} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomArrow}>
        <Text style={{ color: colors.accent, fontSize: 18 }}>▼</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height * 0.95,
    backgroundColor: '#000',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  navbar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 45 : 25,
    left: 15,
    right: 15,
    zIndex: 100,
  },
  navTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  navLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  navItem: {
    paddingVertical: 4,
  },
  navItemText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.8,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  getStartedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
  },
  getStartedText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    gap: 3,
  },
  loginSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  loginSmallText: {
    fontSize: 6,
    fontWeight: '900',
    color: '#000',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
    marginTop: 80,
  },
  heroLine: {
    width: 60,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: width < 380 ? 44 : 58,
    fontWeight: '900',
    color: '#fff',
    lineHeight: width < 380 ? 50 : 64,
    textAlign: 'center',
    letterSpacing: -1,
  },
  sphereContainer: {
    position: 'absolute',
    width: 400,
    height: 400,
    top: 50,
    zIndex: -1,
    opacity: 0.4,
  },
  sphere: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  dashboardContainer: {
    width: width * 0.95,
    backgroundColor: 'rgba(12, 20, 40, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 209, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  dashItem: {
    flex: 1,
    alignItems: 'center',
  },
  dashDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dashLabel: {
    fontSize: 7,
    color: colors.muted,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dashValue: {
    fontSize: width < 380 ? 10 : 12,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 6,
    shadowColor: colors.accent,
    shadowRadius: 10,
    shadowOpacity: 0.8,
  },
  ctaWrapper: {
    marginTop: 40,
    alignItems: 'center',
  },
  ctaButton: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 4,
    zIndex: 2,
  },
  ctaText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ctaGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
    opacity: 0.1,
    transform: [{ scale: 1.15 }],
    zIndex: 1,
  },
  bottomArrow: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    opacity: 0.6,
  }
});


