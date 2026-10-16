// Powered by OnSpace.AI
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';

type PermStatus = 'granted' | 'denied' | 'unknown' | 'unsupported';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [notifPerm, setNotifPerm] = useState<PermStatus>('unknown');
  const [callPerm, setCallPerm] = useState<PermStatus>('unknown');
  const [callLogPerm, setCallLogPerm] = useState<PermStatus>('unknown');

  const refreshPerms = useCallback(async () => {
    // Notifications (real)
    try {
      const n = await Notifications.getPermissionsAsync();
      setNotifPerm(n.granted ? 'granted' : n.canAskAgain ? 'unknown' : 'denied');
    } catch {
      setNotifPerm('unsupported');
    }
    // Calls — Android treats dialer intent as available; we expose state by platform
    if (Platform.OS === 'android') {
      setCallPerm('granted'); // dialer intent requires no permission
      setCallLogPerm('unknown'); // native call log API not available in Expo Go
    } else if (Platform.OS === 'ios') {
      setCallPerm('granted');
      setCallLogPerm('unsupported');
    } else {
      setCallPerm('unsupported');
      setCallLogPerm('unsupported');
    }
  }, []);

  useEffect(() => { refreshPerms(); }, [refreshPerms]);
  useFocusEffect(useCallback(() => { refreshPerms(); }, [refreshPerms]));

  const askNotif = async () => {
    try {
      const res = await Notifications.requestPermissionsAsync();
      setNotifPerm(res.granted ? 'granted' : 'denied');
      if (!res.granted) {
        showAlert('Notifications blocked', 'Open settings to allow notifications for follow-up reminders.');
      }
    } catch {
      showAlert('Not supported', 'Notifications are not available in this environment.');
    }
  };

  const openSystemSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      showAlert('Could not open settings', 'Please open your system settings manually.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profile" leftIcon="back" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{user?.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.gxId} · Telecaller</Text>
          <Text style={styles.meta}>{user?.email}</Text>
          <Text style={styles.meta}>{user?.phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permissions</Text>
          <PermRow label="Phone calls" status={callPerm} description="Needed to open the dialer." />
          <PermRow label="Call log" status={callLogPerm} description="Used to auto-fill call duration." />
          <PermRow
            label="Notifications"
            status={notifPerm}
            description="Reminders for scheduled follow-ups."
            action={notifPerm === 'granted' ? undefined : { label: 'Enable', onPress: askNotif }}
          />
          <Button
            label="Open phone settings"
            variant="secondary"
            icon={<MaterialIcons name="settings" size={18} color={Colors.text} />}
            onPress={openSystemSettings}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <Pressable style={styles.listRow} onPress={() => showAlert('Help', 'Contact your admin for support.')}>
            <MaterialIcons name="help-outline" size={20} color={Colors.text} />
            <Text style={styles.listLabel}>Help & support</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textSubtle} />
          </Pressable>
          <Pressable style={styles.listRow} onPress={() => showAlert('About', 'GlobXplorer Telecaller v1.0')}>
            <MaterialIcons name="info-outline" size={20} color={Colors.text} />
            <Text style={styles.listLabel}>About</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textSubtle} />
          </Pressable>
          <Button
            label="Sign out"
            variant="danger"
            onPress={handleSignOut}
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PermRow({ label, status, description, action }: { label: string; status: PermStatus; description: string; action?: { label: string; onPress: () => void } }) {
  const palette = status === 'granted'
    ? { bg: Colors.success + '20', color: Colors.success, text: 'Granted' }
    : status === 'denied'
      ? { bg: Colors.danger + '20', color: Colors.danger, text: 'Denied' }
      : status === 'unsupported'
        ? { bg: Colors.surfaceAlt, color: Colors.textMuted, text: 'Not supported' }
        : { bg: Colors.warning + '20', color: Colors.warning, text: 'Not asked' };
  return (
    <View style={styles.permRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.permLabel}>{label}</Text>
        <Text style={styles.permDesc}>{description}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <View style={[styles.permPill, { backgroundColor: palette.bg }]}>
          <Text style={[styles.permPillText, { color: palette.color }]}>{palette.text}</Text>
        </View>
        {action ? (
          <Pressable onPress={action.onPress}>
            <Text style={styles.permAction}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  initial: { color: '#fff', fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  meta: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardTitle: { fontWeight: FontWeight.semibold, color: Colors.text, fontSize: FontSize.base, marginBottom: Spacing.md },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  permLabel: { color: Colors.text, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  permDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  permPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  permPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  permAction: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listLabel: { flex: 1, color: Colors.text, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
