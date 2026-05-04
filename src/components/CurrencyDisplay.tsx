import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface CurrencyDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  currencyCode?: string;
}

export function CurrencyDisplay({ amount, size = 'md', currencyCode = 'USD' }: CurrencyDisplayProps): React.JSX.Element {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  return (
    <Text style={[styles.amount, styles[size]]}>{formatted}</Text>
  );
}

const styles = StyleSheet.create({
  amount: { fontWeight: '700', color: colors.primary },
  sm: { fontSize: 13 },
  md: { fontSize: 16 },
  lg: { fontSize: 22 },
});
