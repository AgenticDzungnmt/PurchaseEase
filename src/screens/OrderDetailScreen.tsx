import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getPurchaseOrder,
  getPurchaseOrderLines,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receiveAndInvoice,
} from '../services/bcApi';
import { PurchaseOrder, PurchaseOrderLine, OrdersStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type OrderDetailNav = NativeStackNavigationProp<OrdersStackParamList>;
type OrderDetailRoute = RouteProp<OrdersStackParamList, 'OrderDetail'>;

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function OrderDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<OrderDetailNav>();
  const route = useRoute<OrderDetailRoute>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [o, l] = await Promise.all([getPurchaseOrder(orderId), getPurchaseOrderLines(orderId)]);
      setOrder(o);
      setLines(l);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load order');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async () => {
    Alert.alert('Submit Order', 'Submit this draft order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setActionLoading(true);
          try {
            const updated = await updatePurchaseOrder(orderId, { status: 'Open' });
            setOrder(updated);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Order', 'Delete this order permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await deletePurchaseOrder(orderId);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReceive = async () => {
    Alert.alert('Receive & Invoice', 'Mark this order as received and create invoice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setActionLoading(true);
          try {
            const updated = await receiveAndInvoice(orderId);
            setOrder(updated);
            Alert.alert('Success', 'Order received and invoice created.');
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!order) {
    return <View style={styles.centered}><Text>Order not found.</Text></View>;
  }

  const statusColor = getStatusColor(order.status);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.primary} />}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.orderNumber}>{order.number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.vendorName}>{order.vendorName}</Text>
          <InfoRow label="Vendor #" value={order.vendorNumber} />
          <InfoRow label="Order Date" value={order.orderDate} />
          {order.requestedReceiptDate ? <InfoRow label="Receipt Date" value={order.requestedReceiptDate} /> : null}
          {order.postingDate ? <InfoRow label="Posting Date" value={order.postingDate} /> : null}
          <View style={styles.divider} />
          <InfoRow label="Subtotal" value={formatCurrency(order.totalAmountExcludingTax)} />
          <InfoRow label="Tax" value={formatCurrency(order.totalTaxAmount)} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalAmountIncludingTax)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Line Items</Text>
        {lines.length === 0 ? (
          <Text style={styles.emptyText}>No line items.</Text>
        ) : (
          lines.map(line => (
            <View key={line.id} style={styles.lineCard}>
              <Text style={styles.lineDesc}>{line.description}</Text>
              <View style={styles.lineDetails}>
                <Text style={styles.lineDetail}>{line.quantity} {line.unitOfMeasureCode} × {formatCurrency(line.directUnitCost)}</Text>
                {line.discountPercent > 0 && <Text style={styles.lineDiscount}>{line.discountPercent}% disc.</Text>}
                <Text style={styles.lineAmount}>{formatCurrency(line.amountIncludingTax)}</Text>
              </View>
              {line.receivedQuantity > 0 && (
                <Text style={styles.receivedQty}>Received: {line.receivedQuantity}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {actionLoading ? (
        <View style={styles.actionsBar}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.actionsBar}>
          {order.status === 'Draft' && (
            <>
              <TouchableOpacity style={styles.actionBtnDanger} onPress={handleDelete}>
                <Text style={styles.actionBtnDangerText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('EditOrder', { orderId })}>
                <Text style={styles.actionBtnSecondaryText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSubmit}>
                <Text style={styles.actionBtnText}>Submit</Text>
              </TouchableOpacity>
            </>
          )}
          {order.status === 'Open' && (
            <>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('EditOrder', { orderId })}>
                <Text style={styles.actionBtnSecondaryText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleReceive}>
                <Text style={styles.actionBtnText}>Receive & Invoice</Text>
              </TouchableOpacity>
            </>
          )}
          {(order.status === 'Received' || order.status === 'In Review') && (
            <View style={styles.readOnlyBanner}>
              <Text style={styles.readOnlyText}>This order is {order.status.toLowerCase()} — view only.</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  headerCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: spacing.base, ...shadows.card },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statusBadge: { borderRadius: borderRadius.full, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  vendorName: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  lineCard: { backgroundColor: colors.white, borderRadius: borderRadius.sm, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  lineDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  lineDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineDetail: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  lineDiscount: { fontSize: 12, color: colors.statusInReview, marginRight: spacing.sm },
  lineAmount: { fontSize: 14, fontWeight: '700', color: colors.primary },
  receivedQty: { fontSize: 12, color: colors.statusReceived, marginTop: 4 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  actionsBar: { flexDirection: 'row', gap: spacing.sm, padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  actionBtnSecondary: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  actionBtnSecondaryText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  actionBtnDanger: { flex: 1, borderWidth: 1.5, borderColor: colors.error, borderRadius: borderRadius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' },
  actionBtnDangerText: { color: colors.error, fontWeight: '700', fontSize: 15 },
  readOnlyBanner: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  readOnlyText: { color: colors.textSecondary, fontSize: 13 },
});
