// Powered by OnSpace.AI
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { ScreenHeader } from '@/components/feature/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useLeads } from '@/hooks/useLeads';
import { parseCsv } from '@/services/leadsService';
import { useAlert } from '@/template';

export default function AddLeadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { user } = useAuth();
  const { addLead, bulkAdd } = useLeads();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [course, setCourse] = useState('');
  const [intake, setIntake] = useState('');
  const [budget, setBudget] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  const isBulk = params.mode === 'bulk';

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      showAlert('Required fields', 'Name and phone number are required.');
      return;
    }
    setSaving(true);
    await addLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      country: country.trim(),
      course: course.trim(),
      intake: intake.trim(),
      budget: budget.trim(),
      assignedTo: user?.id ?? null,
      consentRecording: consent,
    });
    setSaving(false);
    showAlert('Lead added', `${name} has been added to your leads.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleBulkUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', '*/*'] });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      const text = await FileSystem.readAsStringAsync(asset.uri);
      const rows = parseCsv(text);
      const n = await bulkAdd(rows.map((r) => ({
        name: r.name,
        phone: r.phone,
        email: r.email,
        country: r.country,
        course: r.course,
        intake: r.intake,
        budget: r.budget,
      })), user?.id ?? null);
      showAlert('Upload complete', `${n} lead${n === 1 ? '' : 's'} imported from CSV.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      showAlert('Upload failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={isBulk ? 'Upload bulk leads' : 'Add lead'} leftIcon="back" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {isBulk ? (
            <View>
              <View style={styles.infoCard}>
                <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>CSV format</Text>
                  <Text style={styles.infoBody}>
                    Headers: name, phone, email, country, course, intake, budget.{'\n'}
                    Only name and phone are required.
                  </Text>
                </View>
              </View>
              <Button label="Pick CSV file" icon={<MaterialIcons name="upload-file" size={18} color="#fff" />} onPress={handleBulkUpload} fullWidth />
              <Pressable onPress={() => router.setParams({ mode: 'single' } as never)} style={styles.switchLink}>
                <Text style={styles.switchLinkText}>Add a single lead instead</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Input label="Full name" placeholder="Ravi Kumar" value={name} onChangeText={setName} />
              <Input label="Phone number" placeholder="+91…" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label="Email" placeholder="name@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Input label="Country of interest" placeholder="Canada" value={country} onChangeText={setCountry} />
              <Input label="Course" placeholder="MS Computer Science" value={course} onChangeText={setCourse} />
              <Input label="Intake" placeholder="Fall 2026" value={intake} onChangeText={setIntake} />
              <Input label="Budget" placeholder="₹25-30 L" value={budget} onChangeText={setBudget} />

              <Pressable onPress={() => setConsent((v) => !v)} style={styles.consent}>
                <View style={[styles.checkbox, consent ? styles.checkboxOn : null]}>
                  {consent ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
                </View>
                <Text style={styles.consentText}>Lead has given consent to record calls</Text>
              </Pressable>

              <Button label="Save lead" loading={saving} onPress={handleSave} fullWidth style={{ marginTop: Spacing.md }} />
              <Pressable onPress={() => router.setParams({ mode: 'bulk' } as never)} style={styles.switchLink}>
                <Text style={styles.switchLinkText}>Upload bulk leads from CSV</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  infoTitle: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  infoBody: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4, lineHeight: 18 },
  consent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  consentText: { color: Colors.textMuted, fontSize: FontSize.sm, flex: 1 },
  switchLink: { marginTop: Spacing.lg, alignItems: 'center' },
  switchLinkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
