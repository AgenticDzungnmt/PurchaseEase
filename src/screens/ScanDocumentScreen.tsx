import React, { useState } from 'react';
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

// Mock extracted data from a scan
const MOCK_SCAN_RESULT = {
  vendor: 'Global Tech Solutions',
  invoiceNumber: 'INV-GT-2024-0581',
  invoiceDate: '2024-11-20',
  lineItems: [
    { description: '27" 4K Monitor', quantity: 2, unitCost: 330.00 },
    { description: 'USB-C Hub 7-in-1', quantity: 5, unitCost: 28.00 },
  ],
  totalAmount: 800.00,
};

export function ScanDocumentScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateNav>();
  const [stage, setStage] = useState<'idle' | 'scanning' | 'done'>('idle');
  const spinValue = React.useRef(new Animated.Value(0)).current;

  const startScan = () => {
    setStage('scanning');
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
    // Simulate scan completing after 2.5s
    setTimeout(() => {
      setStage('done');
    }, 2500);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Coming soon banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🤖</Text>
          <View>
            <Text style={styles.bannerTitle}>AI Document Extraction — Coming Soon</Text>
            <Text style={styles.bannerDesc}>Azure Document Intelligence will automatically extract vendor, invoice number, line items, and amounts from scanned documents.</Text>
          </View>
        </View>

        {/* Scan area */}
        <View style={styles.scanArea}>
          {stage === 'idle' && (
            <>
              <Text style={styles.scanAreaText}>📷</Text>
              <Text style={styles.scanPlaceholder}>Tap to scan or import a document</Text>
            </>
          )}
          {stage === 'scanning' && (
            <>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </Animated.View>
              <Text style={styles.scanningText}>Scanning document...</Text>
              <Text style={styles.scanningSubText}>Extracting data with AI</Text>
            </>
          )}
          {stage === 'done' && (
            <>
              <Text style={styles.doneIcon}>✅</Text>
              <Text style={styles.doneText}>Scan complete!</Text>
            </>
          )}
        </View>

        {/* Buttons */}
        {stage === 'idle' && (
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={startScan}>
              <Text style={styles.btnOutlineText}>📷 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={startScan}>
              <Text style={styles.btnOutlineText}>📁 Import File</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Extracted result */}
        {stage === 'done' && (
          <>
            <Text style={styles.sectionTitle}>Extracted Data</Text>
            <View style={styles.resultCard}>
              <ResultRow label="Vendor" value={MOCK_SCAN_RESULT.vendor} />
              <ResultRow label="Invoice #" value={MOCK_SCAN_RESULT.invoiceNumber} />
              <ResultRow label="Invoice Date" value={MOCK_SCAN_RESULT.invoiceDate} />
              <ResultRow label="Total Amount" value={`$${MOCK_SCAN_RESULT.totalAmount.toFixed(2)}`} />

              <Text style={styles.lineItemsTitle}>Line Items</Text>
              {MOCK_SCAN_RESULT.lineItems.map((li, idx) => (
                <View key={idx} style={styles.lineItemRow}>
                  <Text style={styles.lineItemDesc}>{li.description}</Text>
                  <Text style={styles.lineItemQty}>{li.quantity} × ${li.unitCost.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreateOrder')}
            >
              <Text style={styles.createBtnText}>Create Order from Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rescanBtn} onPress={() => setStage('idle')}>
              <Text style={styles.rescanBtnText}>Scan Another Document</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This is a UI placeholder. In production, Azure Document Intelligence will process real documents using a custom-trained model.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  banner: { flexDirection: 'row', backgroundColor: '#EBF5FB', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.base, gap: spacing.sm, alignItems: 'flex-start', borderLeftWidth: 4, borderLeftColor: colors.primary },
  bannerIcon: { fontSize: 24 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  bannerDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  scanArea: { backgroundColor: colors.white, borderRadius: borderRadius.lg, height: 200, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', marginBottom: spacing.base, ...shadows.card },
  scanAreaText: { fontSize: 48, marginBottom: spacing.sm },
  scanPlaceholder: { fontSize: 14, color: colors.textSecondary },
  scanningText: { fontSize: 16, fontWeight: '600', color: colors.primary, marginTop: spacing.md },
  scanningSubText: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  doneIcon: { fontSize: 48 },
  doneText: { fontSize: 16, fontWeight: '600', color: colors.statusReceived, marginTop: spacing.sm },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.base },
  btn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  btnOutline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.white },
  btnOutlineText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  resultCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.base, ...shadows.card },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: colors.divider },
  resultLabel: { fontSize: 13, color: colors.textSecondary },
  resultValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  lineItemsTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase' },
  lineItemRow: { paddingVertical: 4 },
  lineItemDesc: { fontSize: 14, color: colors.textPrimary },
  lineItemQty: { fontSize: 13, color: colors.textSecondary },
  createBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  createBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  rescanBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: spacing.md - 2, alignItems: 'center', marginBottom: spacing.xl },
  rescanBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  disclaimer: { fontSize: 11, color: colors.textDisabled, textAlign: 'center', lineHeight: 16 },
});
