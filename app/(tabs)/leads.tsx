// Powered by OnSpace.AI
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { LeadCard } from '@/components/feature/LeadCard';
import { EmptyState } from '@/components/feature/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
import { startCall } from '@/utils/calling';

type FilterMode = 'mine' | 'all';

export default function LeadsScreen() {
  const { user } = useAuth();
  const { leads } = useLeads();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const initial = (params.filter === 'all' ? 'all' : 'mine') as FilterMode;
  const [mode, setMode] = useState<FilterMode>(initial);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const base = mode === 'mine' ? leads.filter((l) => l.assignedTo === user?.id) : leads;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((l) =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.email ?? '').toLowerCase().includes(q) ||
      (l.country ?? '').toLowerCase().includes(q) ||
      (l.course ?? '').toLowerCase().includes(q)
    );
  }, [leads, mode, query, user?.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Leads"
        subtitle={mode === 'mine' ? 'Assigned to you' : 'All leads'}
        leftIcon="none"
        right={
          <Pressable onPress={() => router.push('/add-lead')} hitSlop={10}>
            <MaterialIcons name="add" size={26} color={Colors.primary} />
          </Pressable>
        }
      />

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            placeholder="Search by name, phone, course"
            placeholderTextColor={Colors.textSubtle}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.segRow}>
        <Segment active={mode === 'mine'} label={`My leads (${leads.filter((l) => l.assignedTo === user?.id).length})`} onPress={() => setMode('mine')} />
        <Segment active={mode === 'all'} label={`Total leads (${leads.length})`} onPress={() => setMode('all')} />
      </View>

      <View style={styles.ctaRow}>
        <Pressable style={({ pressed }) => [styles.ctaPrimary, { opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/add-lead')}>
          <MaterialIcons name="add" size={18} color="#fff" />
          <Text style={styles.ctaPrimaryText}>Add lead</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.ctaSecondary, { opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/add-lead?mode=bulk')}>
          <MaterialIcons name="upload-file" size={18} color={Colors.primary} />
          <Text style={styles.ctaSecondaryText}>Upload bulk leads</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            onPress={() => router.push(`/lead/${item.id}`)}
            onCall={() => startCall(item, user!.id, router)}
          />
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No leads yet" body="Add a lead or upload a CSV to get started." />}
      />
    </SafeAreaView>
  );
}

function Segment({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.seg,
        active ? styles.segActive : styles.segInactive,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.segText, { color: active ? '#fff' : Colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  toolbar: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    ...Shadow.sm,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
  segRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  segActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  segInactive: { backgroundColor: Colors.surface, borderColor: Colors.border },
  segText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12, borderRadius: Radius.md,
    minHeight: 44,
  },
  ctaPrimaryText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  ctaSecondary: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12, borderRadius: Radius.md,
    minHeight: 44,
  },
  ctaSecondaryText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xxxl },
});
