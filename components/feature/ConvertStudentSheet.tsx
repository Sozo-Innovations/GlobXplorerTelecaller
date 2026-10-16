// Powered by OnSpace.AI
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Lead } from '@/services/leadsService';

type Props = {
  visible: boolean;
  lead: Lead | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConvertStudentSheet({ visible, lead, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <MaterialIcons name="school" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Convert to student?</Text>
          <Text style={styles.body}>
            {lead?.name} will be moved from your leads list and a new student record will be created.
          </Text>
          <View style={styles.summary}>
            <Row label="Course" value={lead?.course ?? '—'} />
            <Row label="Country" value={lead?.country ?? '—'} />
            <Row label="Intake" value={lead?.intake ?? '—'} />
          </View>
          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button label="Convert" variant="success" onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  body: {
    marginTop: 6,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  summary: {
    alignSelf: 'stretch',
    marginTop: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  rowValue: { color: Colors.text, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  actions: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
});
