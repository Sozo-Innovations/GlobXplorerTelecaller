// Powered by OnSpace.AI
import { Alert, Linking, Platform } from 'react-native';
import { Lead } from '@/services/leadsService';
import { logCallStart } from '@/services/callsService';

type Pushable = { push: (href: string) => void };

export async function startCall(lead: Lead, userId: string, router: Pushable) {
  if (!lead.phone) {
    Alert.alert('No phone number', 'This lead does not have a phone number saved.');
    return;
  }
  const telUrl = `tel:${lead.phone.replace(/\s/g, '')}`;
  const started = new Date().toISOString();
  const entry = await logCallStart({
    leadId: lead.id,
    leadName: lead.name,
    phone: lead.phone,
    userId,
    startedAt: started,
  });
  try {
    const supported = await Linking.canOpenURL(telUrl);
    if (supported) {
      await Linking.openURL(telUrl);
    } else if (Platform.OS === 'web') {
      // On web preview we cannot dial; still proceed to wrap-up.
    }
  } catch {
    // Ignore and proceed to wrap-up
  }
  setTimeout(() => {
    router.push(`/call-wrap-up?callId=${entry.id}&leadId=${lead.id}`);
  }, 1200);
}
