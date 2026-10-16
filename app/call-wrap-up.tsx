// Powered by OnSpace.AI
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OUTCOMES, OUTCOME_COLORS, Outcome, CONVERT_OUTCOMES } from '@/constants/outcomes';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
import { finalizeCall, getCalls, readLatestCallLogDuration, removeCall } from '@/services/callsService';
import { getLeadById } from '@/services/leadsService';
import { scheduleFollowUp } from '@/services/followUpsService';
import { addRecording } from '@/services/recordingsService';
import { ConvertStudentSheet } from '@/components/feature/ConvertStudentSheet';
import { useAlert } from '@/template';
import type { Lead } from '@/services/leadsService';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function CallWrapUpScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { updateLead, convertToStudent } = useLeads();
  const params = useLocalSearchParams<{ callId?: string; leadId?: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [duration, setDuration] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState('');
  const [followUpChoice, setFollowUpChoice] = useState<'tomorrow' | '3days' | 'pick' | null>(null);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showConvert, setShowConvert] = useState(false);

  useEffect(() => {
    (async () => {
      if (params.callId) {
        const calls = await getCalls();
        const c = calls.find((x) => x.id === params.callId);
        if (c) {
          const d = await readLatestCallLogDuration(c.startedAt);
          setDuration(Math.max(d, 15)); // ensure plausible seed
        }
      }
      if (params.leadId) {
        setLead(await getLeadById(params.leadId));
      }
    })();
  }, [params.callId, params.leadId]);

  const computedFollowUp = useMemo(() => {
    if (followUpChoice === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d;
    }
    if (followUpChoice === '3days') {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(10, 0, 0, 0);
      return d;
    }
    if (followUpChoice === 'pick' && pickedDate) return pickedDate;
    return null;
  }, [followUpChoice, pickedDate]);

  const pickRecording = async () => {
    if (!lead?.consentRecording) {
      showAlert('Consent required', 'This lead has not given consent for call recording. Enable consent in Lead details first.');
      return;
    }
    const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (res.canceled || !res.assets?.[0]) return;
    setRecordingUri(res.assets[0].uri);
    setRecordingName(res.assets[0].name ?? 'Recording');
  };

  const pickFollowUpDate = () => {
    // Lightweight picker: schedule next week 10am
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
    setPickedDate(d);
    setFollowUpChoice('pick');
  };

  const skip = async () => {
    if (params.callId) await removeCall(params.callId);
    router.back();
  };

  const doSave = async () => {
    if (!outcome || !lead || !user) return;
    setSaving(true);
    if (params.callId) {
      await finalizeCall(params.callId, {
        durationSec: duration,
        outcome,
        note: note.trim() || undefined,
        followUpAt: computedFollowUp?.toISOString(),
        recordingUri: recordingUri ?? undefined,
      });
    }
    await updateLead(lead.id, {
      lastOutcome: outcome,
      lastContactedAt: new Date().toISOString(),
      status: outcome === 'Interested' || outcome === 'Qualified' || outcome === 'Ready to Apply'
        ? 'interested'
        : outcome === 'Not interested' || outcome === 'Declined'
          ? 'closed'
          : 'contacted',
    });
    if (computedFollowUp) {
      await scheduleFollowUp({
        leadId: lead.id,
        leadName: lead.name,
        phone: lead.phone,
        userId: user.id,
        scheduledAt: computedFollowUp.toISOString(),
        note: outcome,
      });
    }
    if (recordingUri && lead.consentRecording) {
      await addRecording({
        leadId: lead.id,
        leadName: lead.name,
        uri: recordingUri,
        durationSec: duration,
      });
    }
    setSaving(false);
    router.back();
  };

  const handleSave = () => {
    if (!outcome) {
      showAlert('Pick an outcome', 'Choose one outcome before saving.');
      return;
    }
    if (CONVERT_OUTCOMES.includes(outcome)) {
      setShowConvert(true);
      return;
    }
    doSave();
  };

  const handleConvertConfirm = async () => {
    if (!lead) return;
    setShowConvert(false);
    await doSave();
    await convertToStudent(lead.id);
    showAlert('Converted to student', `${lead.name} has been moved to students.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Call wrap-up" leftIcon="back" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.leadCard}>
            <View style={styles.leadAvatar}>
              <Text style={styles.leadInitial}>{lead?.name.charAt(0) ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leadName}>{lead?.name ?? 'Unknown lead'}</Text>
              <Text style={styles.leadMeta}>{lead?.phone}</Text>
            </View>
            <View style={styles.durationChip}>
              <MaterialIcons name="timer" size={14} color={Colors.primary} />
              <Text style={styles.durationText}>{fmt(duration)}</Text>
            </View>
          </View>
          <Text style={styles.hint}>Duration auto-filled from your phone's call log.</Text>

          <Text style={styles.section}>Outcome</Text>
          <View style={styles.outcomes}>
            {OUTCOMES.map((o) => {
              const active = outcome === o;
              const c = OUTCOME_COLORS[o];
              return (
                <Pressable
                  key={o}
                  onPress={() => setOutcome(o)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: c, backgroundColor: active ? c : c + '15', opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : c }]}>{o}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.section}>Note</Text>
          <Input
            placeholder="Add any notes from this call…"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Text style={styles.section}>Follow-up</Text>
          <View style={styles.row}>
            <FUChip label="Tomorrow" active={followUpChoice === 'tomorrow'} onPress={() => { setFollowUpChoice('tomorrow'); setPickedDate(null); }} />
            <FUChip label="In 3 days" active={followUpChoice === '3days'} onPress={() => { setFollowUpChoice('3days'); setPickedDate(null); }} />
            <FUChip label={pickedDate ? pickedDate.toLocaleDateString() : 'Pick date'} active={followUpChoice === 'pick'} onPress={pickFollowUpDate} />
          </View>

          <Text style={styles.section}>Recording (optional)</Text>
          <Pressable style={styles.recRow} onPress={pickRecording}>
            <MaterialIcons name="attach-file" size={20} color={Colors.primary} />
            <Text style={styles.recText}>
              {recordingName ? recordingName : (lead?.consentRecording ? 'Attach a recording' : 'Consent required to attach')}
            </Text>
          </Pressable>

          <View style={styles.actions}>
            <Button label="Skip for now" variant="ghost" onPress={skip} style={{ flex: 1 }} />
            <Button label="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConvertStudentSheet
        visible={showConvert}
        lead={lead}
        onCancel={() => setShowConvert(false)}
        onConfirm={handleConvertConfirm}
      />
    </SafeAreaView>
  );
}

function FUChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fuChip,
        active ? styles.fuChipActive : styles.fuChipInactive,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.fuChipText, { color: active ? '#fff' : Colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.sm },
  leadCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  leadAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  leadInitial: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.lg },
  leadName: { color: Colors.text, fontWeight: FontWeight.semibold, fontSize: FontSize.base },
  leadMeta: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  durationChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.pill,
  },
  durationText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.xs },
  hint: { color: Colors.textSubtle, fontSize: FontSize.xs, marginTop: 4 },
  section: {
    marginTop: Spacing.lg,
    color: Colors.text, fontWeight: FontWeight.semibold, fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  outcomes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  fuChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  fuChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  fuChipInactive: { backgroundColor: Colors.surface, borderColor: Colors.border },
  fuChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  recRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderStrong,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  recText: { color: Colors.textMuted, fontSize: FontSize.sm, flex: 1 },
  actions: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
