import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger';

interface ActionButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

export function ActionButton({ label, variant = 'primary', loading, style, disabled, ...rest }: ActionButtonProps): React.JSX.Element {
  const btnStyle = variant === 'primary' ? styles.primary
    : variant === 'secondary' ? styles.secondary
    : styles.danger;
  const textStyle = variant === 'secondary' ? styles.secondaryText : styles.primaryText;

  return (
    <TouchableOpacity
      style={[styles.base, btnStyle, (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} size="small" />
        : <Text style={textStyle}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: borderRadius.md, paddingVertical: spacing.md - 2, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  secondaryText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
