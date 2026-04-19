// Coming Soon — "You're not alone."
// Shown when user taps a not-yet-built safety scenario card
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { ArrowIcon } from '@/components/icons/Arrow'
import { Pressable } from 'react-native'
import { BottomNav } from '@/components/ui/BottomNav'

export default function ComingSoonScreen() {
  const { colors, type, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />

      <View style={{ flex: 1, paddingHorizontal: spacing.screenH }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { marginTop: insets.top + 12, opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>

        <Text style={[type.heroTitle, { color: '#5B5CF6', marginTop: 28, marginBottom: 12 }]}>
          You're not alone.
        </Text>

        <Text style={[type.body, { color: colors.textSecondary, lineHeight: 20, marginBottom: 24 }]}>
          This feature is on its way. In the meantime, use the EEZ Fraud Detector or reach out to one of our emergency helplines — real people are ready to help.
        </Text>

        <Pressable
          onPress={() => router.push('/safety/helplines')}
          style={({ pressed }) => [styles.helplinesBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={[type.label, { color: '#5B5CF6' }]}>see helplines →</Text>
        </Pressable>
      </View>

      <BottomNav activeTab="home" />
    </View>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  helplinesBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
})
