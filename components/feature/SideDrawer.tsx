// Powered by OnSpace.AI
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SideDrawer({ visible, onClose }: Props) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const go = (path: string) => {
    onClose();
    setTimeout(() => router.push(path as never), 50);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.replace('/sign-in');
  };

  const items = [
    { icon: 'person', label: 'My leads', onPress: () => go('/leads?filter=mine') },
    { icon: 'groups', label: 'Total leads', onPress: () => go('/leads?filter=all') },
    { icon: 'event', label: 'Follow-ups', onPress: () => go('/followups') },
    { icon: 'account-circle', label: 'Profile', onPress: () => go('/profile') },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.drawer, { paddingTop: insets.top + Spacing.lg }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name.charAt(0) ?? 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userMeta}>{user?.gxId}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          {items.map((it) => (
            <Pressable
              key={it.label}
              onPress={it.onPress}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? Colors.surfaceAlt : 'transparent' }]}
            >
              <MaterialIcons name={it.icon as never} size={22} color={Colors.text} />
              <Text style={styles.rowLabel}>{it.label}</Text>
            </Pressable>
          ))}
          <View style={styles.divider} />
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.row, { backgroundColor: pressed ? '#FEE2E2' : 'transparent' }]}
          >
            <MaterialIcons name="logout" size={22} color={Colors.danger} />
            <Text style={[styles.rowLabel, { color: Colors.danger }]}>Sign out</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    flexDirection: 'row',
  },
  drawer: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopRightRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  userMeta: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  rowLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
});
