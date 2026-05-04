import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Item } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.displayName}</Text>
      <Text style={styles.sub}>{item.number} • {item.type}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>Cost: {formatCurrency(item.unitCost)}</Text>
        <Text style={styles.inventory}>Stock: {item.inventory} {item.baseUnitOfMeasureCode}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, ...shadows.card },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  price: { fontSize: 13, fontWeight: '600', color: colors.primary },
  inventory: { fontSize: 12, color: colors.textDisabled },
});
