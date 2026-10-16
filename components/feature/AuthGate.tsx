// Powered by OnSpace.AI
import React, { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const first = segments[0] as string | undefined;
    if (!user && first !== 'sign-in') {
      router.replace('/sign-in');
    } else if (user && first === 'sign-in') {
      router.replace('/(tabs)');
    } else if (user && !first) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
