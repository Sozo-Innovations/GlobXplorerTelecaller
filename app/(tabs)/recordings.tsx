// Powered by OnSpace.AI
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { EmptyState } from '@/components/feature/EmptyState';
import { Recording, getRecordings, removeRecording } from '@/services/recordingsService';
import { useAlert } from '@/template';

export default function RecordingsScreen() {
  const [items, setItems] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { showAlert } = useAlert();

  const load = useCallback(async () => {
    setItems(await getRecordings());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const stop = async () => {
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
    setPlayingId(null);
    setProgress(0);
  };

  const play = async (rec: Recording) => {
    if (playingId === rec.id) {
      await stop();
      return;
    }
    await stop();
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: rec.uri });
      soundRef.current = sound;
      setPlayingId(rec.id);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        const pos = status.positionMillis ?? 0;
        const dur = status.durationMillis ?? Math.max(1, rec.durationSec * 1000);
        setProgress(Math.min(1, pos / dur));
        if (status.didJustFinish) stop();
      });
      await sound.playAsync();
    } catch {
      showAlert('Playback failed', 'Could not play this recording.');
      await stop();
    }
  };

  const confirmDelete = (rec: Recording) => {
    showAlert('Delete recording?', `Remove recording for ${rec.leadName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await removeRecording(rec.id); load(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Recordings" subtitle="Only consented leads" leftIcon="none" />
      <FlatList
        data={items}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => {
          const isPlaying = playingId === item.id;
          return (
            <View style={styles.item}>
              <View style={styles.rowTop}>
                <View style={styles.iconWrap}>
                  <MaterialIcons name="mic" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.leadName}</Text>
                  <Text style={styles.sub}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                  <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
                </Pressable>
              </View>
              <View style={styles.playerRow}>
                <Pressable style={styles.playBtn} onPress={() => play(item)}>
                  <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={22} color="#fff" />
                </Pressable>
                <View style={styles.barWrap}>
                  <View style={[styles.barFill, { width: `${(isPlaying ? progress : 0) * 100}%` }]} />
                </View>
                <Text style={styles.time}>{formatTime(item.durationSec)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon="mic-none" title="No recordings" body="Attach a recording from a call wrap-up (consent required)." />}
      />
    </SafeAreaView>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.md,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { color: Colors.text, fontWeight: FontWeight.semibold, fontSize: FontSize.base },
  sub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  playBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  barWrap: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: Colors.primary },
  time: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium, minWidth: 40, textAlign: 'right' },
});
