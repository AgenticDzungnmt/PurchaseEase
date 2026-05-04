import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getPurchaseOrder,
  getPurchaseOrderLines,
  updatePurchaseOrder,
  updatePurchaseOrderLine,
  deletePurchaseOrderLine,
} from '../services/bcApi';
import { PurchaseOrder, PurchaseOrderLine, OrdersStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type EditNav = NativeStackNavigationProp<OrdersStackParamList>;
type EditRoute = RouteProp<OrdersStackParamList, 'EditOrder'>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function EditOrderScreen(): React.JSX.Element {
  const navigation = useNavigation<EditNav>();
  const route = useRoute<EditRoute>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [o, l] = await Promise.all([getPurchaseOrder(orderId), getPurchaseOrderLines(orderId)]);
      setOrder(o);
      setLines(l);
      setNotes(o.notes || '');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveNotes = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await updatePurchaseOrder(orderId, { notes });
      setOrder(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateLineField = async (
    lineId: string,
    field: 'quantity' | 'directUnitCost' | 'discountPercent',
    value: string,
  ) => {
    const numVal = parseFloat(value) || 0;
    try {
      const updated = await updatePurchaseOrderLine(orderId, lineId, { [field]: numVal });
      setLines(prev => prev.map(l => (l.id === lineId ? updated : l)));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteLineItem = async (lineId: string) => {
    Alert.alert('Delete Line', 'Remove this line item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePurchaseOrderLine(orderId, lineId);
            setLines(prev => prev.filter(l => l.id !== lineId));
          } catch (e: any) {
            Alert.alert('Error', e.message);
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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Order Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={colors.textDisabled}
          />
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={saveNotes}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>Save Notes</Text>
          }
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Line Items</Text>
        {lines.map(line => (
          <View key={line.id} style={styles.lineCard}>
            <View style={styles.lineHeader}>
              <Text style={styles.lineDesc}>{line.description}</Text>
              <TouchableOpacity onPress={() => deleteLineItem(line.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lineFields}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Qty</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="numeric"
                  defaultValue={String(line.quantity)}
                  onEndEditing={e => updateLineField(line.id, 'quantity', e.nativeEvent.text)}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Unit Cost</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="numeric"
                  defaultValue={String(line.directUnitCost)}
                  onEndEditing={e => updateLineField(line.id, 'directUnitCost', e.nativeEvent.text)}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Disc %</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="numeric"
                  defaultValue={String(line.discountPercent)}
                  onEndEditing={e => updateLineField(line.id, 'discountPercent', e.nativeEvent.text)}
                />
              </View>
            </View>
            <Text style={styles.lineTotal}>Total: {formatCurrency(line.amountIncludingTax)}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  formGroup: { marginBottom: spacing.base },
  formLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  notesInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.white, height: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.sm + 2, alignItems: 'center', marginBottom: spacing.xl },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontWeight: '700' },
  lineCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  lineDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  deleteText: { color: colors.error, fontSize: 13, fontWeight: '600' },
  lineFields: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, padding: spacing.sm, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background },
  lineTotal: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: spacing.sm, textAlign: 'right' },
  cancelBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  cancelBtnText: { color: colors.textPrimary, fontWeight: '600' },
});
