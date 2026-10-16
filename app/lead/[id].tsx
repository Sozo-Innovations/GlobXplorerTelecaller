// Powered by OnSpace.AI
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { OUTCOME_COLORS, Outcome } from '@/constants/outcomes';
import { Lead, getLeadById } from '@/services/leadsService';
import { useLeads } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { startCall } from '@/utils/calling';
import { Note, addNote, getNotesForLead } from '@/services/notesService';
import { useAlert } from '@/template';

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { updateLead } = useLeads();
  const { showAlert } = useAlert();

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState('');
  const [attachment, setAttachment] = useState<{ uri: string; name: string } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLead(await getLeadById(id));
    setNotes(await getNotesForLead(id));
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!lead) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Lead" leftIcon="back" />
        <View style={{ padding: Spacing.lg }}>
          <Text style={{ color: Colors.textMuted }}>Lead not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openWhatsApp = () => {
    const num = lead.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${num}`).catch(() => showAlert('Error', 'Could not open WhatsApp.'));
  };
  const openEmail = () => {
    if (!lead.email) return showAlert('No email', 'This lead does not have an email address.');
    Linking.openURL(`mailto:${lead.email}`).catch(() => {});
  };
  const toggleConsent = async () => {
    await updateLead(lead.id, { consentRecording: !lead.consentRecording });
    load();
  };
  const pickAttachment = async () => {
    const res = await DocumentPicker.getDocumentAsync({});
    if (res.canceled || !res.assets?.[0]) return;
    setAttachment({ uri: res.assets[0].uri, name: res.assets[0].name ?? 'file' });
  };
  const submitNote = async () => {
    if (!noteText.trim() && !attachment) return;
    if (!user) return;
    await addNote({
      leadId: lead.id,
      userId: user.id,
      userGxId: user.gxId,
      text: noteText.trim(),
      attachmentUri: attachment?.uri,
      attachmentName: attachment?.name,
    });
    setNoteText('');
    setAttachment(null);
    load();
  };

  const outcome = lead.lastOutcome as Outcome | undefined;
  const outcomeColor = outcome ? OUTCOME_COLORS[outcome] : Colors.textMuted;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={lead.name} subtitle={lead.phone} leftIcon="back" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroInitial}>{lead.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{lead.name}</Text>
              <Text style={styles.heroSub}>{lead.course || '—'}</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <Tag label={lead.status.toUpperCase()} color={Colors.primary} />
              </View>
            </View>
          </View>

          <View style={styles.heroActions}>
            <HeroAction icon="phone" color={Colors.accent} label="Call" onPress={() => startCall(lead, user!.id, router)} />
            <HeroAction icon="message" color="#25D366" label="WhatsApp" onPress={openWhatsApp} />
            <HeroAction icon="email" color={Colors.primary} label="Email" onPress={openEmail} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <Row icon="public" label="Country" value={lead.country || '—'} />
          <Row icon="school" label="Course" value={lead.course || '—'} />
          <Row icon="event" label="Intake" value={lead.intake || '—'} />
          <Row icon="payments" label="Budget" value={lead.budget || '—'} />
          <Row icon="email" label="Email" value={lead.email || '—'} />
          {outcome ? <Row icon="flag" label="Last outcome" value={outcome} valueColor={outcomeColor} /> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.consentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Call recording consent</Text>
              <Text style={styles.cardSub}>Required to attach or play recordings for this lead.</Text>
            </View>
            <Pressable onPress={toggleConsent} style={[styles.toggle, lead.consentRecording ? styles.toggleOn : styles.toggleOff]}>
              <View style={[styles.toggleDot, lead.consentRecording ? styles.toggleDotOn : styles.toggleDotOff]} />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add a note</Text>
          <Input
            placeholder="What happened on the call?"
            value={noteText}
            onChangeText={setNoteText}
            multiline
            numberOfLines={3}
            style={{ minHeight: 70, textAlignVertical: 'top' }}
          />
          <Pressable onPress={pickAttachment} style={styles.attachBtn}>
            <MaterialIcons name="attach-file" size={18} color={Colors.primary} />
            <Text style={styles.attachText}>{attachment ? attachment.name : 'Attach a file'}</Text>
          </Pressable>
          <Button label="Add note" onPress={submitNote} fullWidth style={{ marginTop: Spacing.md }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          {notes.length === 0 ? (
            <Text style={styles.emptyNotes}>No notes yet.</Text>
          ) : (
            notes.map((n) => (
              <View key={n.id} style={styles.noteItem}>
                <View style={styles.noteDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteMeta}>
                    {n.userGxId} · {new Date(n.createdAt).toLocaleString()}
                  </Text>
                  {n.text ? <Text style={styles.noteText}>{n.text}</Text> : null}
                  {n.attachmentName ? (
                    <View style={styles.noteAttach}>
                      <MaterialIcons name="attach-file" size={14} color={Colors.primary} />
                      <Text style={styles.noteAttachText}>{n.attachmentName}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroAction({ icon, color, label, onPress }: { icon: string; color: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.heroAct, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={[styles.heroActIcon, { backgroundColor: color }]}>
        <MaterialIcons name={icon as never} size={20} color="#fff" />
      </View>
      <Text style={styles.heroActLabel}>{label}</Text>
    </Pressable>
  );
}

function Row({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon as never} size={16} color={Colors.textMuted} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  heroInitial: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.xl },
  heroName: { color: Colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.lg },
  heroSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  heroActions: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroAct: { flex: 1, alignItems: 'center', gap: 6 },
  heroActIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  heroActLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.semibold },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardTitle: { fontWeight: FontWeight.semibold, color: Colors.text, fontSize: FontSize.base, marginBottom: Spacing.sm },
  cardSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: { color: Colors.textMuted, fontSize: FontSize.sm, flex: 1 },
  rowValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    padding: 3,
  },
  toggleOn: { backgroundColor: Colors.success },
  toggleOff: { backgroundColor: Colors.borderStrong },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleDotOn: { alignSelf: 'flex-end' },
  toggleDotOff: { alignSelf: 'flex-start' },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  attachText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.xs },
  noteItem: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.sm },
  noteDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary,
    marginTop: 6,
  },
  noteMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  noteText: { color: Colors.text, fontSize: FontSize.sm, marginTop: 4, lineHeight: 20 },
  noteAttach: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  noteAttachText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  emptyNotes: { color: Colors.textSubtle, fontSize: FontSize.sm },
});
