// Powered by OnSpace.AI
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { EmptyState } from '@/components/feature/EmptyState';
import { FollowUp, completeFollowUp, getFollowUps, groupFollowUps } from '@/services/followUpsService';
import { useAlert } from '@/template';

export default function FollowUpsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<FollowUp[]>([]);
  const { showAlert } = useAlert();

  const load = useCallback(async () => {
    setItems(await getFollowUps());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const groups = useMemo(() => groupFollowUps(items), [items]);

  const handleComplete = async (id: string) => {
    await completeFollowUp(id);
    load();
    showAlert('Marked done', 'Follow-up moved out of the active list.');
  };

  const renderGroup = (title: string, icon: string, color: string, data: FollowUp[]) => (
    <View style={{ marginBottom: Spacing.lg }}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.length}</Text>
        </View>
      </View>
      {data.length === 0 ? (
        <Text style={styles.emptyHint}>Nothing scheduled.</Text>
      ) : (
        data.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => router.push(`/lead/${f.leadId}`)}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={[styles.timeChip, { backgroundColor: color + '20' }]}>
              <MaterialIcons name={icon as never} size={16} color={color} />
              <Text style={[styles.timeText, { color }]}>{new Date(f.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{f.leadName}</Text>
              <Text style={styles.itemSub}>{f.note ?? 'Scheduled follow-up'}</Text>
            </View>
            <Pressable onPress={() => handleComplete(f.id)} hitSlop={8} style={styles.doneBtn}>
              <MaterialIcons name="check" size={18} color={Colors.success} />
            </Pressable>
          </Pressable>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Follow-ups" subtitle="Stay on top of your schedule" leftIcon="none" />
      <ScrollView contentContainerStyle={styles.content}>
        {items.filter((i) => !i.done).length === 0 ? (
          <EmptyState icon="event-available" title="No follow-ups" body="Follow-ups scheduled from calls will appear here." />
        ) : (
          <>
            {renderGroup('Overdue', 'error-outline', Colors.danger, groups.overdue)}
            {renderGroup('Today', 'today', Colors.primary, groups.today)}
            {renderGroup('Tomorrow', 'event', Colors.warning, groups.tomorrow)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1 },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.semibold },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  timeChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  itemName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  itemSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  doneBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.success + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyHint: { color: Colors.textSubtle, fontSize: FontSize.sm, paddingLeft: 16 },
});
