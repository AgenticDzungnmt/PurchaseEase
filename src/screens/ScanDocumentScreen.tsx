import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type CreateNav = NativeStackNavigationProp<CreateStackParamList>;

const MOCK_SCAN_RESULT = {
  vendor: 'Global Tech Solutions',
  invoiceNumber: 'INV-GT-2024-0581',
  invoiceDate: '2024-11-20',
  lineItems: [
    { description: '27" 4K Monitor', quantity: 2, unitCost: 330.00 },
    { description: 'USB-C Hub 7-in-1', quantity: 5, unitCost: 28.00 },
  ],
  total: 800.00,
};

export function ScanDocumentScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateNav>();
  const [stage, setStage] = useState<'idle' | 'scanning' | 'done'>('idle');
  const spinValue = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      animRef.current?.stop();
    };
  }, []);

  const startScan = () => {
    setStage('scanning');
    animRef.current = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 1500, useNativeDriver: true }),
    );
    animRef.current.start();
    timerRef.current = setTimeout(() => {
      animRef.current?.stop();
      spinValue.setValue(0);
      setStage('done');
    }, 2500);
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.comingSoonBanner}>
          <Text style={styles.bannerTitle}>📷 Document Intelligence</Text>
          <Text style={styles.bannerSubtitle}>Azure AI Document Intelligence integration coming soon. This screen demonstrates the planned workflow.</Text>
        </View>

        {stage === 'idle' && (
          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadTitle}>Scan or Upload Invoice</Text>
            <Text style={styles.uploadSubtitle}>Capture a photo of your vendor invoice to auto-fill a purchase order.</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={startScan}>
                <Text style={styles.actionBtnText}>📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={startScan}>
                <Text style={styles.actionBtnSecondaryText}>📂 Choose File</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {stage === 'scanning' && (
          <View style={styles.scanningView}>
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </Animated.View>
            <Text style={styles.scanningText}>Analyzing document...</Text>
          </View>
        )}

        {stage === 'done' && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Document Analyzed</Text>
            <Text style={styles.resultVendor}>Vendor: {MOCK_SCAN_RESULT.vendor}</Text>
            <Text style={styles.resultField}>Invoice #: {MOCK_SCAN_RESULT.invoiceNumber}</Text>
            <Text style={styles.resultField}>Date: {MOCK_SCAN_RESULT.invoiceDate}</Text>
            <Text style={styles.resultField}>Total: ${MOCK_SCAN_RESULT.total.toFixed(2)}</Text>
            <Text style={styles.resultSubTitle}>Line Items Detected:</Text>
            {MOCK_SCAN_RESULT.lineItems.map((item, i) => (
              <Text key={i} style={styles.lineItemText}>• {item.description} ×{item.quantity} @ ${item.unitCost}</Text>
            ))}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreateOrder')}
            >
              <Text style={styles.createBtnText}>Create Order from Scan</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  comingSoonBanner: { backgroundColor: '#EFF6FF', borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.base, borderLeftWidth: 4, borderLeftColor: colors.primary },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  uploadArea: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.xl, alignItems: 'center', ...shadows.card },
  uploadIcon: { fontSize: 48, marginBottom: spacing.md },
  uploadTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  uploadSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.base },
  actionBtnText: { color: colors.white, fontWeight: '700' },
  actionBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  actionBtnSecondaryText: { color: colors.primary, fontWeight: '700' },
  scanningView: { alignItems: 'center', paddingVertical: spacing.xxxl },
  spinner: { marginBottom: spacing.base },
  scanningText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  resultCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.base, ...shadows.card },
  resultTitle: { fontSize: 16, fontWeight: '700', color: colors.statusReceived, marginBottom: spacing.sm },
  resultVendor: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  resultField: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  resultSubTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.sm, marginBottom: 4 },
  lineItemText: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  createBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.base },
  createBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
