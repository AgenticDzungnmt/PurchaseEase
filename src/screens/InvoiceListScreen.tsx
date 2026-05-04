import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getPurchaseInvoices } from '../services/bcApi';
import { PurchaseInvoice, InvoicesStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type InvoicesNav = NativeStackNavigationProp<InvoicesStackParamList>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function InvoiceListScreen(): React.JSX.Element {
  const navigation = useNavigation<InvoicesNav>();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadInvoices = useCallback(async () => {
    try {
      const data = await getPurchaseInvoices();
      setInvoices(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const onRefresh = () => { setRefreshing(true); loadInvoices(); };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !q || inv.number.toLowerCase().includes(q) || inv.vendorName.toLowerCase().includes(q);
    const matchFrom = !dateFrom || inv.postingDate >= dateFrom;
    const matchTo = !dateTo || inv.postingDate <= dateTo;
    return matchSearch && matchFrom && matchTo;
  });

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Filters */}
      <View style={styles.filterArea}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoice or vendor..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textDisabled}
        />
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.dateInput, { flex: 1 }]}
            placeholder="From (YYYY-MM-DD)"
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholderTextColor={colors.textDisabled}
          />
          <Text style={styles.dateSep}>—</Text>
          <TextInput
            style={[styles.dateInput, { flex: 1 }]}
            placeholder="To (YYYY-MM-DD)"
            value={dateTo}
            onChangeText={setDateTo}
            placeholderTextColor={colors.textDisabled}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={inv => inv.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No invoices found.</Text>
          </View>
        }
        renderItem={({ item: inv }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <Text style={styles.invoiceNum}>{inv.number}</Text>
              <View style={styles.postedBadge}>
                <Text style={styles.postedBadgeText}>{inv.status}</Text>
              </View>
            </View>
            <Text style={styles.vendorName}>{inv.vendorName}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.invoiceDate}>{inv.postingDate}</Text>
              <Text style={styles.invoiceAmount}>{formatCurrency(inv.totalAmountIncludingTax)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterArea: { padding: spacing.base, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background, marginBottom: spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2, fontSize: 13, color: colors.textPrimary, backgroundColor: colors.background },
  dateSep: { color: colors.textSecondary, fontSize: 14 },
  list: { padding: spacing.base, paddingBottom: spacing.xxxl },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  invoiceNum: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  postedBadge: { backgroundColor: colors.statusPosted + '20', borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  postedBadgeText: { fontSize: 12, fontWeight: '600', color: colors.statusPosted },
  vendorName: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceDate: { fontSize: 12, color: colors.textDisabled },
  invoiceAmount: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
});
