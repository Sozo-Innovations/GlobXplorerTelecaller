// Powered by OnSpace.AI
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { SideDrawer } from '@/components/feature/SideDrawer';
import { LeadCard } from '@/components/feature/LeadCard';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
import { getFollowUps, groupFollowUps, FollowUp } from '@/services/followUpsService';
import { getCalls, CallEntry } from '@/services/callsService';
import { startCall } from '@/utils/calling';

export default function HomeScreen() {
  const { user } = useAuth();
  const { leads, refresh } = useLeads();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [calls, setCalls] = useState<CallEntry[]>([]);

  const loadStats = useCallback(async () => {
    setFollowUps(await getFollowUps());
    setCalls(await getCalls());
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
    loadStats();
  }, [refresh, loadStats]));

  useEffect(() => { loadStats(); }, [loadStats]);

  const myLeads = useMemo(() => leads.filter((l) => l.assignedTo === user?.id), [leads, user?.id]);
  const groups = useMemo(() => groupFollowUps(followUps), [followUps]);
  const todayFollowUps = groups.today.length + groups.overdue.length;
  const todayCalls = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return calls.filter((c) => new Date(c.startedAt).getTime() >= start.getTime()).length;
  }, [calls]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="GlobXplorer"
        subtitle="Telecaller workspace"
        leftIcon="menu"
        onLeftPress={() => setDrawerOpen(true)}
        right={
          <Pressable onPress={() => router.push('/profile')} hitSlop={10}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name.charAt(0)}</Text></View>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroHi}>{greeting},</Text>
          <Text style={styles.heroName}>{user?.name ?? 'Agent'}</Text>
          <Text style={styles.heroMeta}>{user?.gxId} · Telecaller</Text>
        </View>

        <View style={styles.stats}>
          <StatCard icon="people" color={Colors.primary} label="My leads" value={myLeads.length} onPress={() => router.push('/leads?filter=mine')} />
          <StatCard icon="event" color={Colors.warning} label="Follow-ups" value={todayFollowUps} onPress={() => router.push('/followups')} />
          <StatCard icon="phone" color={Colors.accent} label="Calls today" value={todayCalls} onPress={() => router.push('/(tabs)/calls')} />
        </View>

        <View style={styles.quickActions}>
          <QuickAction icon="person-add" label="Add lead" onPress={() => router.push('/add-lead')} />
          <QuickAction icon="upload-file" label="Upload CSV" onPress={() => router.push('/add-lead?mode=bulk')} />
          <QuickAction icon="event-note" label="Follow-ups" onPress={() => router.push('/followups')} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My recent leads</Text>
          <Pressable onPress={() => router.push('/leads?filter=mine')}>
            <Text style={styles.linkText}>See all</Text>
          </Pressable>
        </View>

        <View style={{ gap: Spacing.sm }}>
          {myLeads.slice(0, 4).map((l) => (
            <LeadCard
              key={l.id}
              lead={l}
              onPress={() => router.push(`/lead/${l.id}`)}
              onCall={() => startCall(l, user!.id, router)}
            />
          ))}
          {myLeads.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="people-outline" size={28} color={Colors.textSubtle} />
              <Text style={styles.emptyText}>No leads assigned yet. Add a lead to get started.</Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}

function StatCard({ icon, color, label, value, onPress }: { icon: string; color: string; label: string; value: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statCard, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon as never} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.qa, { opacity: pressed ? 0.85 : 1 }]}>
      <MaterialIcons name={icon as never} size={20} color={Colors.primary} />
      <Text style={styles.qaLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontWeight: FontWeight.bold },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.md,
  },
  heroHi: { color: '#DBEAFE', fontSize: FontSize.sm },
  heroName: { color: '#fff', fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginTop: 2 },
  heroMeta: { color: '#BFDBFE', fontSize: FontSize.xs, marginTop: 4 },
  stats: { flexDirection: 'row', gap: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    ...Shadow.sm,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  statLabel: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.xs },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  qa: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  qaLabel: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  linkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    gap: 6,
  },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
});
