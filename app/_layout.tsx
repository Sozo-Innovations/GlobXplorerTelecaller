// Powered by OnSpace.AI
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeadsProvider } from '@/contexts/LeadsContext';
import { AuthGate } from '@/components/feature/AuthGate';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <LeadsProvider>
            <AuthGate>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="sign-in" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="add-lead" options={{ presentation: 'modal' }} />
                <Stack.Screen name="call-wrap-up" options={{ presentation: 'modal' }} />
                <Stack.Screen name="profile" />
                <Stack.Screen name="lead/[id]" />
              </Stack>
            </AuthGate>
          </LeadsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
