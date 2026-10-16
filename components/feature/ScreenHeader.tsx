// Powered by OnSpace.AI
import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftIcon?: 'menu' | 'back' | 'none';
  onLeftPress?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, leftIcon = 'back', onLeftPress, right }: Props) {
  const router = useRouter();
  const handleLeft = () => {
    if (onLeftPress) return onLeftPress();
    if (leftIcon === 'back') router.back();
  };

  return (
    <View style={styles.header}>
      {leftIcon !== 'none' ? (
        <Pressable onPress={handleLeft} hitSlop={10} style={styles.iconBtn}>
          <MaterialIcons name={leftIcon === 'menu' ? 'menu' : 'arrow-back'} size={24} color={Colors.text} />
        </Pressable>
      ) : <View style={{ width: 24 }} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  iconBtn: {
    padding: 4,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  right: {
    minWidth: 24,
    alignItems: 'flex-end',
  },
});
