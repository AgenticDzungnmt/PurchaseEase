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
import { getPurchaseOrders } from '../services/bcApi';
import { PurchaseOrder, PurchaseOrderStatus, OrdersStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type OrdersNav = NativeStackNavigationProp<OrdersStackParamList>;

const STATUS_TABS: Array<PurchaseOrderStatus | 'All'> = ['All', 'Draft', 'Open', 'In Review', 'Received'];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Draft': return colors.statusDraft;
    case 'Open': return colors.statusOpen;
    case 'In Review': return colors.statusInReview;
    case 'Received': return colors.statusReceived;
    default: return colors.statusDraft;
  }
}

export function OrderListScreen(): React.JSX.Element {
  const navigation = useNavigation<OrdersNav>();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<PurchaseOrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      const data = await getPurchaseOrders();
      setOrders(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const onRefresh = () => { setRefreshing(true); loadOrders(); };

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'All' || o.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || o.number.toLowerCase().includes(q) || o.vendorName.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search order or vendor..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textDisabled}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={s => s}
          renderItem={({ item: tab }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders found.</Text>
          </View>
        }
        renderItem={({ item: order }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <Text style={styles.orderNum}>{order.number}</Text>
              <View style={[styles.badge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
              </View>
            </View>
            <Text style={styles.vendorName}>{order.vendorName}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.orderDate}>{order.orderDate}</Text>
              <Text style={styles.orderAmount}>{formatCurrency(order.totalAmountIncludingTax)}</Text>
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
  searchBar: { padding: spacing.base, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background },
  tabsRow: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsContent: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: borderRadius.full, marginRight: 8, backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.white, fontWeight: '700' },
  list: { padding: spacing.base, paddingBottom: spacing.xxxl },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNum: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  badge: { borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  vendorName: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  orderDate: { fontSize: 12, color: colors.textDisabled },
  orderAmount: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
});
