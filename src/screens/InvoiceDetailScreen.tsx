import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native-stack';
import { getPurchaseInvoices } from '../services/bcApi';
import { PurchaseInvoice, InvoicesStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type InvoiceDetailRoute = RouteProp<InvoicesStackParamList, 'InvoiceDetail'>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function InvoiceDetailScreen(): React.JSX.Element {
  const route = useRoute<InvoiceDetailRoute>();
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPurchaseInvoices()
      .then(invs => {
        const found = invs.find(i => i.id === invoiceId);
        setInvoice(found || null);
      })
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!invoice) {
    return <View style={styles.centered}><Text>Invoice not found.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>{invoice.status}</Text>
        </View>

        {/* Main card */}
        <View style={styles.card}>
          <Text style={styles.invoiceNumber}>{invoice.number}</Text>
          <Text style={styles.vendorName}>{invoice.vendorName}</Text>
          <View style={styles.divider} />
          <InfoRow label="Vendor #" value={invoice.vendorNumber} />
          <InfoRow label="Invoice Date" value={invoice.invoiceDate} />
          <InfoRow label="Posting Date" value={invoice.postingDate} />
          <InfoRow label="Order #" value={invoice.orderNumber} />
          <View style={styles.divider} />
          <InfoRow label="Subtotal" value={formatCurrency(invoice.totalAmountExcludingTax)} />
          <InfoRow label="Tax" value={formatCurrency(invoice.totalAmountIncludingTax - invoice.totalAmountExcludingTax)} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.totalAmountIncludingTax)}</Text>
          </View>
        </View>

        <View style={styles.readOnlyNote}>
          <Text style={styles.readOnlyText}>🔒 This is a posted invoice — read only.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  statusBanner: { backgroundColor: colors.statusPosted + '20', borderRadius: borderRadius.md, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.base },
  statusText: { color: colors.statusPosted, fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.base, ...shadows.card },
  invoiceNumber: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  vendorName: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: 17, fontWeight: '800', color: colors.primary },
  readOnlyNote: { backgroundColor: '#FFF3CD', borderRadius: borderRadius.sm, padding: spacing.md, marginTop: spacing.base, borderLeftWidth: 3, borderLeftColor: '#FFC107' },
  readOnlyText: { fontSize: 13, color: '#856404' },
});
