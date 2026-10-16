// Powered by OnSpace.AI
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { EmptyState } from '@/components/feature/EmptyState';
import { CallEntry, getCalls } from '@/services/callsService';
import { OUTCOME_COLORS, Outcome } from '@/constants/outcomes';
import { Pressable } from 'react-native';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function CallsScreen() {
  const router = useRouter();
  const [calls, setCalls] = useState<CallEntry[]>([]);

  const load = useCallback(async () => {
    setCalls(await getCalls());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Calls" subtitle={`${calls.length} call${calls.length === 1 ? '' : 's'} logged`} leftIcon="none" />
      <FlatList
        data={calls}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push(`/lead/${item.leadId}`)}
          >
            <View style={styles.avatar}>
              <MaterialIcons name="phone" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.leadName}</Text>
                <Text style={styles.time}>{new Date(item.startedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={styles.phone}>{item.phone}</Text>
              <View style={styles.metaRow}>
                <View style={styles.meta}>
                  <MaterialIcons name="timer" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{formatDuration(item.durationSec)}</Text>
                </View>
                {item.outcome ? (
                  <View style={[styles.outcome, { backgroundColor: OUTCOME_COLORS[item.outcome as Outcome] + '20' }]}>
                    <Text style={[styles.outcomeText, { color: OUTCOME_COLORS[item.outcome as Outcome] }]}>{item.outcome}</Text>
                  </View>
                ) : (
                  <View style={[styles.outcome, { backgroundColor: Colors.surfaceAlt }]}>
                    <Text style={[styles.outcomeText, { color: Colors.textMuted }]}>No outcome</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState icon="phone-missed" title="No calls yet" body="Tap the call button on any lead to start." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { flex: 1, color: Colors.text, fontWeight: FontWeight.semibold, fontSize: FontSize.base },
  time: { color: Colors.textSubtle, fontSize: FontSize.xs },
  phone: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 8,
  },
  meta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
  },
  metaText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  outcome: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  outcomeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
