import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PurchaseOrderStatus, InvoiceStatus } from '../types';
import { colors, borderRadius } from '../theme';

type BadgeStatus = PurchaseOrderStatus | InvoiceStatus;

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Draft: { bg: colors.statusDraft + '25', text: colors.statusDraft },
  Open: { bg: colors.statusOpen + '20', text: colors.statusOpen },
  'In Review': { bg: colors.statusInReview + '25', text: colors.statusInReview },
  Received: { bg: colors.statusReceived + '20', text: colors.statusReceived },
  Posted: { bg: colors.statusPosted + '20', text: colors.statusPosted },
  Cancelled: { bg: colors.error + '20', text: colors.error },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status] ?? { bg: colors.border, text: colors.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.badgeText, { color: config.text }, size === 'sm' && styles.badgeTextSm]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeTextSm: { fontSize: 11 },
});
