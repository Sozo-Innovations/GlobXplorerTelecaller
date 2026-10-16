// Powered by OnSpace.AI
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { showAlert } = useAlert();

  const handleSignIn = async () => {
    if (!identifier.trim() || !password) {
      showAlert('Missing details', 'Enter your GX ID / email / phone and password.');
      return;
    }
    setLoading(true);
    const user = await signIn(identifier, password);
    setLoading(false);
    if (!user) {
      showAlert('Sign in failed', 'The credentials you entered do not match. Ask your admin if you need help.');
    }
  };

  const handleAdminHelp = () => {
    showAlert(
      'Ask your admin',
      'Account creation and password resets are managed by your GlobXplorer admin. Please contact them to set up or reset your access.'
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <MaterialIcons name="public" size={32} color="#fff" />
            </View>
            <Text style={styles.brandTitle}>GlobXplorer</Text>
            <Text style={styles.brandSub}>Telecaller</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Sign in</Text>
            <Text style={styles.subheading}>Use your GX ID, email, or phone number.</Text>

            <Input
              label="GX ID / Email / Phone"
              placeholder="GX-TC-001"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
              leftIcon={<MaterialIcons name="person" size={18} color={Colors.textMuted} />}
            />
            <Input
              label="Password"
              placeholder="Enter password"
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={setPassword}
              leftIcon={<MaterialIcons name="lock" size={18} color={Colors.textMuted} />}
            />
            <Pressable onPress={() => setShowPwd((v) => !v)} style={styles.showPwd}>
              <MaterialIcons name={showPwd ? 'visibility-off' : 'visibility'} size={16} color={Colors.textMuted} />
              <Text style={styles.showPwdText}>{showPwd ? 'Hide password' : 'Show password'}</Text>
            </Pressable>

            <Button label="Sign in" onPress={handleSignIn} loading={loading} fullWidth style={{ marginTop: Spacing.md }} />

            <View style={styles.helpBox}>
              <MaterialIcons name="info-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.helpText}>
                Need an account or password reset?{' '}
                <Text style={styles.helpLink} onPress={handleAdminHelp}>Ask your admin</Text>.
              </Text>
            </View>
          </View>

          <View style={styles.mockHint}>
            <Text style={styles.mockHintText}>Demo: GX-TC-001 / 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  brandSub: {
    marginTop: 2,
    color: '#DBEAFE',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
  },
  heading: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subheading: {
    marginTop: 4,
    marginBottom: Spacing.lg,
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  showPwd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  showPwdText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  helpBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  helpText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  helpLink: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  mockHint: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  mockHintText: {
    color: '#DBEAFE',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
