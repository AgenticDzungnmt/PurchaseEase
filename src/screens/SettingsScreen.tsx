import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetMockData } from '../services/bcApi';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { appConfig } from '../config/appConfig';
import { colors, spacing, borderRadius, shadows } from '../theme';

const APP_VERSION = '1.0.0';

export function SettingsScreen(): React.JSX.Element {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_session').then(val => {
      if (val) setProfile(JSON.parse(val));
    });
  }, []);

  const handleClearData = () => {
    Alert.alert(
      'Clear Demo Data',
      'This will reset all in-memory data back to original seed data. Any orders or changes made this session will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetMockData();
            Alert.alert('Done', 'Demo data has been reset.');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>🏠 Running in Demo Mode — No live data connection.</Text>
        </View>

        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{profile?.displayName || 'User'}</Text>
              <Text style={styles.profileDetail}>{profile?.username}</Text>
              <Text style={styles.profileDetail}>Environment: {profile?.environment || appConfig.appEnvironmentName}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingsRow} onPress={handleClearData}>
            <Text style={styles.settingsRowText}>🔄 Clear Cached Data</Text>
            <Text style={styles.settingsRowArrow}>›</Text>
          </TouchableOpacity>
          <Text style={styles.settingsRowHint}>Resets all in-memory demo data back to original seed values.</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsRowText}>📦 App Version</Text>
            <Text style={styles.settingsRowValue}>{APP_VERSION}</Text>
          </View>
          <View style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <Text style={styles.settingsRowText}>App Name</Text>
            <Text style={styles.settingsRowValue}>{appConfig.appDisplayName}</Text>
          </View>
          <View style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <Text style={styles.settingsRowText}>Environment</Text>
            <Text style={styles.settingsRowValue}>{appConfig.appEnvironmentName}</Text>
          </View>
          <Text style={styles.aboutDesc}>
            PurchaseEase is a mobile purchase order management app built with React Native, designed for purchase departments to create, manage, and track orders on-the-go.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  demoBanner: { backgroundColor: '#FFF3CD', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.base, borderLeftWidth: 4, borderLeftColor: '#FFC107' },
  demoBannerText: { fontSize: 13, color: '#856404', fontWeight: '500' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.base, ...shadows.card },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  profileDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  settingsRowText: { fontSize: 15, color: colors.textPrimary },
  settingsRowValue: { fontSize: 14, color: colors.textSecondary },
  settingsRowArrow: { fontSize: 18, color: colors.textDisabled },
  settingsRowHint: { fontSize: 12, color: colors.textDisabled, marginTop: 4 },
  aboutDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.sm },
  logoutBtn: { backgroundColor: colors.error, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  logoutBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
