import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { appConfig } from '../config/appConfig';
import { colors, spacing, borderRadius } from '../theme';
import { UserProfile } from '../types';

export function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate auth delay
    await new Promise(r => setTimeout(r, 800));
    if (
      username.toLowerCase() === appConfig.demoUsername.toLowerCase() &&
      password === appConfig.demoPassword
    ) {
      const profile: UserProfile = {
        username: appConfig.demoUsername,
        displayName: appConfig.demoUsername.charAt(0).toUpperCase() + appConfig.demoUsername.slice(1),
        environment: appConfig.appEnvironmentName,
        loginTime: new Date().toISOString(),
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(profile));
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
    } else {
      setError('Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>PE</Text>
            </View>
            <Text style={styles.appName}>{appConfig.appDisplayName}</Text>
            <Text style={styles.tagline}>Purchase Order Management</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Demo Environment — {appConfig.appEnvironmentName}</Text>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={t => { setUsername(t); setError(''); }}
                placeholder="Enter username"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textDisabled}
                  secureTextEntry={!passwordVisible}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(v => !v)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{passwordVisible ? '🙀' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Demo hint */}
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>📦 Demo Mode</Text>
              <Text style={styles.hintText}>Username: {appConfig.demoUsername}</Text>
              <Text style={styles.hintText}>Password: {appConfig.demoPassword}</Text>
            </View>
          </View>

          <Text style={styles.footer}>No live data — running on local demo data</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xxl,
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  appName: { fontSize: 26, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.base },
  label: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeBtn: { padding: spacing.sm, marginLeft: spacing.xs },
  eyeText: { fontSize: 18 },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  hintBox: {
    backgroundColor: '#EBF5FB',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  hintTitle: { fontSize: 13, fontWeight: '600', color: colors.primary, marginBottom: 4 },
  hintText: { fontSize: 13, color: colors.textSecondary },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: spacing.xl },
});
