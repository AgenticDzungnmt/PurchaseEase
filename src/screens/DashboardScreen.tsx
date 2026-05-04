import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getPurchaseOrders } from '../services/bcApi';
import { PurchaseOrder, DashboardStackParamList, MainTabParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type DashboardNav = NativeStackNavigationProp<DashboardStackParamList>;
type TabNav = BottomTabNavigationProp<MainTabParamList>;

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

export function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<DashboardNav>();
  const tabNavigation = useNavigation<TabNav>();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getPurchaseOrders();
      setOrders(data);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalOpen = orders.filter(o => o.status === 'Open').length;
  const ordersThisMonth = orders.filter(o => o.orderDate.startsWith(thisMonth)).length;
  const pendingReceipt = orders.filter(o => o.status === 'Open' && !o.fullyReceived).length;
  const totalAmount = orders
    .filter(o => o.status === 'Open')
    .reduce((acc, o) => acc + o.totalAmountIncludingTax, 0);

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeText}>Good day 👋</Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Open Orders" value={String(totalOpen)} color={colors.statusOpen} />
          <SummaryCard label="This Month" value={String(ordersThisMonth)} color={colors.primary} />
          <SummaryCard label="Pending Receipt" value={String(pendingReceipt)} color={colors.statusInReview} />
          <SummaryCard label="Total Amount" value={formatCurrency(totalAmount)} color={colors.statusReceived} small />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction icon="📝" label="New Order" onPress={() => navigation.navigate('CreateOrder')} />
          <QuickAction icon="📷" label="Scan Doc" onPress={() => tabNavigation.navigate('CreateTab')} />
          <QuickAction icon="📄" label="All Orders" onPress={() => tabNavigation.navigate('OrdersTab')} />
          <QuickAction icon="🧾" label="Invoices" onPress={() => tabNavigation.navigate('InvoicesTab')} />
        </View>

        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {recentOrders.length === 0 ? (
          <Text style={styles.emptyText}>No orders yet.</Text>
        ) : (
          recentOrders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              activeOpacity={0.7}
            >
              <View style={styles.orderCardTop}>
                <Text style={styles.orderNumber}>{order.number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.vendorName}>{order.vendorName}</Text>
              <View style={styles.orderCardBottom}>
                <Text style={styles.orderDate}>{order.orderDate}</Text>
                <Text style={styles.orderAmount}>{formatCurrency(order.totalAmountIncludingTax)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, small && styles.summaryValueSm, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  welcomeRow: { marginBottom: spacing.base },
  welcomeText: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.card,
  },
  summaryValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  summaryValueSm: { fontSize: 16 },
  summaryLabel: { fontSize: 12, color: colors.textSecondary },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xs },
  quickActions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.card,
  },
  quickActionIcon: { fontSize: 22, marginBottom: 4 },
  quickActionLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  orderCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  vendorName: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  orderCardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  orderDate: { fontSize: 12, color: colors.textDisabled },
  orderAmount: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
