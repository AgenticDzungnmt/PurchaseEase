import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Vendor } from '../types';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface VendorCardProps {
  vendor: Vendor;
  compact?: boolean;
}

export function VendorCard({ vendor, compact }: VendorCardProps): React.JSX.Element {
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Text style={styles.name}>{vendor.displayName}</Text>
      <Text style={styles.sub}>{vendor.number} • {vendor.city}, {vendor.state}</Text>
      {!compact && (
        <>
          <Text style={styles.detail}>{vendor.addressLine1}</Text>
          <Text style={styles.detail}>{vendor.phoneNumber} • {vendor.email}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, ...shadows.card },
  compact: { padding: spacing.sm },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detail: { fontSize: 12, color: colors.textDisabled, marginTop: 2 },
});
