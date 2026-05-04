import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getVendors,
  getItems,
  createPurchaseOrder,
  createPurchaseOrderLine,
} from '../services/bcApi';
import { Vendor, Item, DraftOrderLine, CreateStackParamList } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

type CreateNav = NativeStackNavigationProp<CreateStackParamList>;

const STEPS = ['Vendor', 'Lines', 'Details', 'Review'];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function CreateOrderScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateNav>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  // Step 2
  const [items, setItems] = useState<Item[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [lines, setLines] = useState<DraftOrderLine[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);

  // Step 3
  const [orderDate, setOrderDate] = useState(new Date());
  const [receiptDate, setReceiptDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showReceiptDatePicker, setShowReceiptDatePicker] = useState(false);

  useEffect(() => {
    getVendors({ orderby: 'displayName' }).then(setVendors).finally(() => setVendorLoading(false));
  }, []);

  const loadItems = useCallback(async (q: string) => {
    setItemLoading(true);
    try {
      const data = await getItems({ filter: q || undefined, orderby: 'displayName' });
      setItems(data);
    } finally {
      setItemLoading(false);
    }
  }, []);

  const filteredVendors = vendors.filter(v =>
    v.displayName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    v.number.toLowerCase().includes(vendorSearch.toLowerCase()),
  );

  const lineTotal = lines.reduce((acc, l) => {
    const sub = l.quantity * l.directUnitCost * (1 - l.discountPercent / 100);
    return acc + sub * 1.08;
  }, 0);

  const addLine = (item: Item) => {
    setLines(prev => [
      ...prev,
      {
        tempId: `${Date.now()}`,
        item,
        description: item.displayName,
        unitOfMeasureCode: item.baseUnitOfMeasureCode,
        quantity: 1,
        directUnitCost: item.unitCost,
        discountPercent: 0,
      },
    ]);
    setShowItemPicker(false);
  };

  const removeLine = (tempId: string) => setLines(prev => prev.filter(l => l.tempId !== tempId));

  const updateLine = (tempId: string, field: keyof DraftOrderLine, value: string | number) => {
    setLines(prev =>
      prev.map(l =>
        l.tempId === tempId
          ? { ...l, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value }
          : l,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      const order = await createPurchaseOrder({
        vendorId: selectedVendor.id,
        vendorNumber: selectedVendor.number,
        vendorName: selectedVendor.displayName,
        orderDate: orderDate.toISOString().split('T')[0],
        requestedReceiptDate: receiptDate.toISOString().split('T')[0],
        buyFromAddressLine1: selectedVendor.addressLine1,
        buyFromCity: selectedVendor.city,
        buyFromState: selectedVendor.state,
        buyFromCountry: selectedVendor.country,
        buyFromPostalCode: selectedVendor.postalCode,
        notes,
      });
      for (const line of lines) {
        await createPurchaseOrderLine(order.id, {
          itemId: line.item?.id,
          lineObjectNumber: line.item?.number,
          description: line.description,
          unitOfMeasureCode: line.unitOfMeasureCode,
          quantity: line.quantity,
          directUnitCost: line.directUnitCost,
          discountPercent: line.discountPercent,
          expectedReceiptDate: receiptDate.toISOString().split('T')[0],
        });
      }
      Alert.alert(
        'Order Created!',
        `Purchase order ${order.number} created successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ── Step 1: Vendor ── */}
        {step === 0 && (
          <>
            <Text style={styles.stepTitle}>Select Vendor</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or number..."
              value={vendorSearch}
              onChangeText={setVendorSearch}
              placeholderTextColor={colors.textDisabled}
            />
            {vendorLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              filteredVendors.map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.listCard, selectedVendor?.id === v.id && styles.listCardSelected]}
                  onPress={() => setSelectedVendor(v)}
                >
                  <Text style={styles.listCardTitle}>{v.displayName}</Text>
                  <Text style={styles.listCardSub}>{v.number} • {v.city}, {v.state}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* ── Step 2: Lines ── */}
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Add Line Items</Text>
            {lines.map((line, idx) => (
              <View key={line.tempId} style={styles.lineCard}>
                <View style={styles.lineCardHeader}>
                  <Text style={styles.lineCardTitle}>{line.description}</Text>
                  <TouchableOpacity onPress={() => removeLine(line.tempId)}>
                    <Text style={styles.removeBtn}>Remove</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.lineFields}>
                  <View style={styles.lineField}>
                    <Text style={styles.fieldLabel}>Qty</Text>
                    <TextInput
                      style={styles.fieldInput}
                      keyboardType="numeric"
                      value={String(line.quantity)}
                      onChangeText={v => updateLine(line.tempId, 'quantity', v)}
                    />
                  </View>
                  <View style={styles.lineField}>
                    <Text style={styles.fieldLabel}>Unit Cost</Text>
                    <TextInput
                      style={styles.fieldInput}
                      keyboardType="decimal-pad"
                      value={String(line.directUnitCost)}
                      onChangeText={v => updateLine(line.tempId, 'directUnitCost', v)}
                    />
                  </View>
                  <View style={styles.lineField}>
                    <Text style={styles.fieldLabel}>Disc %</Text>
                    <TextInput
                      style={styles.fieldInput}
                      keyboardType="numeric"
                      value={String(line.discountPercent)}
                      onChangeText={v => updateLine(line.tempId, 'discountPercent', v)}
                    />
                  </View>
                </View>
                <Text style={styles.lineTotal}>
                  {formatCurrency(line.quantity * line.directUnitCost * (1 - line.discountPercent / 100) * 1.08)}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addLineBtn} onPress={() => { loadItems(itemSearch); setShowItemPicker(true); }}>
              <Text style={styles.addLineBtnText}>+ Add Item</Text>
            </TouchableOpacity>
            {lines.length > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Running Total (incl. tax):</Text>
                <Text style={styles.totalValue}>{formatCurrency(lineTotal)}</Text>
              </View>
            )}
          </>
        )}

        {/* ── Step 3: Details ── */}
        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Order Details</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Order Date</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowOrderDatePicker(true)}>
                <Text style={styles.dateBtnText}>{orderDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            {showOrderDatePicker && (
              <DateTimePicker
                value={orderDate}
                mode="date"
                display="default"
                onChange={(_, d) => { setShowOrderDatePicker(Platform.OS === 'ios'); if (d) setOrderDate(d); }}
              />
            )}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Requested Receipt Date</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowReceiptDatePicker(true)}>
                <Text style={styles.dateBtnText}>{receiptDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            {showReceiptDatePicker && (
              <DateTimePicker
                value={receiptDate}
                mode="date"
                display="default"
                onChange={(_, d) => { setShowReceiptDatePicker(Platform.OS === 'ios'); if (d) setReceiptDate(d); }}
              />
            )}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.fieldInput, styles.notesInput]}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes..."
                placeholderTextColor={colors.textDisabled}
              />
            </View>
          </>
        )}

        {/* ── Step 4: Review ── */}
        {step === 3 && selectedVendor && (
          <>
            <Text style={styles.stepTitle}>Review & Submit</Text>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Vendor</Text>
              <Text style={styles.reviewText}>{selectedVendor.displayName} ({selectedVendor.number})</Text>
              <Text style={styles.reviewSubText}>{selectedVendor.city}, {selectedVendor.state}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Order Details</Text>
              <Text style={styles.reviewText}>Order Date: {orderDate.toLocaleDateString()}</Text>
              <Text style={styles.reviewText}>Receipt Date: {receiptDate.toLocaleDateString()}</Text>
              {notes ? <Text style={styles.reviewText}>Notes: {notes}</Text> : null}
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Line Items ({lines.length})</Text>
              {lines.map(line => (
                <View key={line.tempId} style={styles.reviewLine}>
                  <Text style={styles.reviewLineDesc}>{line.description}</Text>
                  <Text style={styles.reviewLineAmt}>{line.quantity} × {formatCurrency(line.directUnitCost)}</Text>
                  <Text style={styles.reviewLineTotal}>{formatCurrency(line.quantity * line.directUnitCost * (1 - line.discountPercent / 100) * 1.08)}</Text>
                </View>
              ))}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(lineTotal)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, step === 0 && !selectedVendor && styles.btnDisabled]}
            onPress={() => {
              if (step === 0 && !selectedVendor) { Alert.alert('Select a vendor first'); return; }
              if (step === 1 && lines.length === 0) { Alert.alert('Add at least one line item'); return; }
              setStep(s => s + 1);
            }}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextBtn, submitting && styles.btnDisabled]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.nextBtnText}>Submit Order</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Item Picker Modal */}
      <Modal visible={showItemPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Item</Text>
            <TouchableOpacity onPress={() => setShowItemPicker(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={itemSearch}
            onChangeText={q => { setItemSearch(q); loadItems(q); }}
            placeholderTextColor={colors.textDisabled}
          />
          {itemLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={i => i.id}
              contentContainerStyle={{ padding: spacing.base }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listCard} onPress={() => addLine(item)}>
                  <Text style={styles.listCardTitle}>{item.displayName}</Text>
                  <Text style={styles.listCardSub}>{item.number} • Cost: {formatCurrency(item.unitCost)} • Stock: {item.inventory}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  stepDotTextActive: { color: colors.white },
  stepLabel: { fontSize: 10, color: colors.textDisabled },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  stepTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.base },
  searchInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.white, marginBottom: spacing.md },
  listCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1.5, borderColor: 'transparent', ...shadows.card },
  listCardSelected: { borderColor: colors.primary },
  listCardTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  listCardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  lineCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  lineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  lineCardTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  removeBtn: { fontSize: 13, color: colors.error },
  lineFields: { flexDirection: 'row', gap: spacing.sm },
  lineField: { flex: 1 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 6, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.background },
  notesInput: { height: 80, textAlignVertical: 'top' },
  lineTotal: { textAlign: 'right', fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 4 },
  addLineBtn: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  addLineBtnText: { color: colors.primary, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, ...shadows.card },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  totalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  formGroup: { marginBottom: spacing.base },
  formLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  dateBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, backgroundColor: colors.white },
  dateBtnText: { fontSize: 15, color: colors.textPrimary },
  reviewSection: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, ...shadows.card },
  reviewSectionTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewText: { fontSize: 14, color: colors.textPrimary, marginBottom: 2 },
  reviewSubText: { fontSize: 13, color: colors.textSecondary },
  reviewLine: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.sm, marginTop: spacing.sm },
  reviewLineDesc: { fontSize: 14, color: colors.textPrimary },
  reviewLineAmt: { fontSize: 13, color: colors.textSecondary },
  reviewLineTotal: { fontSize: 14, fontWeight: '600', color: colors.primary, textAlign: 'right' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md, marginTop: spacing.sm, borderTopWidth: 2, borderTopColor: colors.primary },
  grandTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  grandTotalValue: { fontSize: 17, fontWeight: '800', color: colors.primary },
  navRow: { flexDirection: 'row', padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  backBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2 },
  backBtnText: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  nextBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2 },
  nextBtnText: { fontSize: 15, color: colors.white, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  modalClose: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
