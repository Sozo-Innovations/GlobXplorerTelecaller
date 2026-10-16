// Powered by OnSpace.AI
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Lead } from '@/services/leadsService';
import { Tag } from '@/components/ui/Tag';

type Props = {
  lead: Lead;
  onPress?: () => void;
  onCall?: () => void;
};

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: Colors.info,
  contacted: Colors.outcomeContacted,
  interested: Colors.outcomeInterested,
  converted: Colors.success,
  closed: Colors.textSubtle,
};

export function LeadCard({ lead, onPress, onCall }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{lead.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>{lead.name}</Text>
          <Tag label={lead.status.toUpperCase()} color={STATUS_COLORS[lead.status]} />
        </View>
        <Text style={styles.sub} numberOfLines={1}>{lead.course}</Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="public" size={14} color={Colors.textMuted} />
          <Text style={styles.meta}>{lead.country || '—'}</Text>
          <Text style={styles.dot}>•</Text>
          <MaterialIcons name="event" size={14} color={Colors.textMuted} />
          <Text style={styles.meta}>{lead.intake || '—'}</Text>
        </View>
      </View>
      {onCall ? (
        <Pressable
          onPress={onCall}
          hitSlop={8}
          style={({ pressed }) => [styles.callBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="phone" size={22} color="#fff" />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  sub: {
    marginTop: 2,
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  dot: {
    marginHorizontal: 6,
    color: Colors.textSubtle,
  },
  callBtn: {
    backgroundColor: Colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
