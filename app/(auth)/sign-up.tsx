// S06 — Sign Up
// Name (required), email + password (fake auth), stores name in Zustand → Home
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

export default function SignUpScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const signIn = useUserStore((s) => s.signIn)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nameError, setNameError] = useState('')

  function handleSignUp() {
    if (!name.trim()) {
      setNameError('we need your name to personalize your experience')
      return
    }
    setNameError('')
    signIn(name.trim())
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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: spacing.screenH },
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
          <Text style={[type.heroTitle, { color: colors.textPrimary }]}>
            Create your account.
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: 8, lineHeight: 18 }]}>
            your data never leaves your phone — it's only used to personalize your results.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="your name"
            placeholder="e.g. Maya"
            value={name}
            onChangeText={(t) => { setName(t); if (nameError) setNameError('') }}
            error={nameError}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />

          <Input
            label="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            containerStyle={{ marginTop: 16 }}
          />

          <Input
            label="password"
            placeholder="at least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
            containerStyle={{ marginTop: 16 }}
          />
        </View>

        {/* Sign up button */}
        <Button
          label="sign up"
          onPress={handleSignUp}
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

        {/* Sign in link */}
        <View style={styles.signInRow}>
          <Text style={[type.body, { color: colors.textSecondary }]}>already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable hitSlop={8}>
              <Text
                style={[
                  type.body,
                  { color: brand.purpleCTA, fontFamily: 'Inter_700Bold', fontWeight: '700' },
                ]}
              >
                sign in
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Fine print */}
        <Text
          style={[
            type.bodySmall,
            { color: colors.textTertiary, textAlign: 'center', marginTop: 24, lineHeight: 16 },
          ]}
        >
          by signing up you agree to our terms. this is a prototype — no real data is stored.
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
  form: {
    gap: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
