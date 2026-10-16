// Powered by OnSpace.AI
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
};

export function Input({ label, error, leftIcon, style, ...rest }: Props) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrap, error ? { borderColor: Colors.danger } : null]}>
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={Colors.textSubtle}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: 10,
  },
  error: {
    marginTop: 4,
    color: Colors.danger,
    fontSize: FontSize.xs,
  },
});
