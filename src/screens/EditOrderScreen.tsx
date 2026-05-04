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
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
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

  const updateLineField = async (lineId: string, field: keyof PurchaseOrderLine, value: string) => {
    const numVal = parseFloat(value) || 0;
    try {
      const updated = await updatePurchaseOrderLine(orderId, lineId, { [field]: numVal } as Partial<PurchaseOrderLine>);
      setLines(prev => prev.map(l => l.id === lineId ? updated : l));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePurchaseOrder(orderId, { notes });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Order: {order?.number}</Text>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={colors.textDisabled}
          />
        </View>

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
                  keyboardType="decimal-pad"
                  defaultValue={String(line.directUnitCost)}
                  onEndEditing={e => updateLineField(line.id, 'directUnitCost', e.nativeEvent.text)}
                />
              </View>
            </View>
            <Text style={styles.lineAmount}>{formatCurrency(line.amountIncludingTax)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
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
  lineCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  lineDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  deleteText: { color: colors.error, fontSize: 13 },
  lineFields: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 6, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background },
  lineAmount: { textAlign: 'right', fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 4 },
  footer: { padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
