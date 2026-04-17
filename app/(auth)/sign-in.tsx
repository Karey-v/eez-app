// S07 — Sign In
// Email + password — accepts anything, stores name in Zustand, navigates home
import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EezLogo } from '@/components/icons/EezLogo'
import { useUserStore } from '@/store/userStore'

export default function SignInScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const signIn = useUserStore((s) => s.signIn)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSignIn() {
    // Prototype: accept any input — extract name from email as fallback
    const derivedName = email.split('@')[0] || 'you'
    signIn(derivedName)
    router.replace('/(tabs)')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bgPrimary }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: spacing.screenH,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />

        {/* Logo */}
        <View style={styles.logoRow}>
          <EezLogo width={36} height={36} color="#5B5CF6" />
        </View>

        {/* Heading */}
        <View style={styles.heading}>
          <Text style={[type.heroTitle, { color: colors.textPrimary }]}>welcome back.</Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>
            sign in to see your score and pick up where you left off.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />

          <Input
            label="password"
            placeholder="your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
            containerStyle={{ marginTop: 16 }}
          />
        </View>

        {/* Sign in button */}
        <Button
          label="sign in"
          onPress={handleSignIn}
          variant="purple"
          fullWidth
          style={{ marginTop: 28 }}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.borderWeak }]} />
          <Text style={[type.label, { color: colors.textTertiary, marginHorizontal: 12 }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.borderWeak }]} />
        </View>

        {/* Sign up link */}
        <View style={styles.signUpRow}>
          <Text style={[type.body, { color: colors.textSecondary }]}>don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable hitSlop={8}>
              <Text
                style={[
                  type.body,
                  { color: brand.purpleCTA, fontFamily: 'Inter_700Bold', fontWeight: '700' },
                ]}
              >
                sign up
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Prototype note */}
        <Text
          style={[
            type.bodySmall,
            { color: colors.textTertiary, textAlign: 'center', marginTop: 24, lineHeight: 16 },
          ]}
        >
          prototype mode — any email and password will work.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  logoRow: {
    marginBottom: 32,
  },
  heading: {
    marginBottom: 32,
  },
  form: {},
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
