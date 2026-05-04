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
import { appConfig } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius } from '../theme';
import { UserProfile } from '../types';

export function LoginScreen(): React.JSX.Element {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise(r => setTimeout(r, 500));
      if (
        username.trim().toLowerCase() === appConfig.demoUsername.toLowerCase() &&
        password === appConfig.demoPassword
      ) {
        const profile: UserProfile = {
          id: 'demo-user',
          username: username.trim(),
          displayName: 'Demo User',
          email: 'demo@purchaseease.app',
          role: 'Purchaser',
          environment: appConfig.appEnvironmentName,
        };
        await AsyncStorage.setItem('user_session', JSON.stringify(profile));
        signIn();
      } else {
        setError('Invalid username or password.');
      }
    } catch (e) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>PE</Text>
            </View>
            <Text style={styles.appName}>{appConfig.appDisplayName}</Text>
            <Text style={styles.tagline}>Purchase Order Management</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Connect to {appConfig.appEnvironmentName}</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter username"
                placeholderTextColor={colors.textDisabled}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textDisabled}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(p => !p)}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.loginBtnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Demo Credentials</Text>
              <Text style={styles.hintText}>Username: {appConfig.demoUsername}</Text>
              <Text style={styles.hintText}>Password: {appConfig.demoPassword}</Text>
            </View>
          )}
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 30, fontWeight: '900', color: colors.white },
  appName: { fontSize: 26, fontWeight: '800', color: colors.white, marginBottom: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.base,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.base },
  errorText: {
    color: colors.error,
    fontSize: 13,
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputGroup: { marginBottom: spacing.base },
  inputLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderLeftWidth: 0,
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.background,
  },
  eyeText: { fontSize: 16 },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginBtnDisabled: { opacity: 0.65 },
  loginBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  hintBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  hintTitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4, fontWeight: '600' },
  hintText: { fontSize: 13, color: colors.white, fontWeight: '500' },
});
