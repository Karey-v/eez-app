// S12 — Test Intro
// Chips: "5 mins" · "🔒 totally private" · "personalized results"
// CTA: "Start the test"
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { Button } from '@/components/ui/Button'
import { ArrowIcon } from '@/components/icons/Arrow'
import { useTestStore } from '@/store/testStore'

const INFO_CHIPS = [
  { icon: '⏱', label: '5 mins' },
  { icon: '🔒', label: 'totally private' },
  { icon: '✦', label: 'personalized results' },
]

export default function TestIntroScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const resetTest = useTestStore((s) => s.resetTest)

  function handleStart() {
    resetTest()
    router.push('/leakability/question')
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: spacing.screenH,
          },
        ]}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>

        {/* Title */}
        <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 8, marginTop: 24 }]}>
          leakability test
        </Text>
        <Text style={[type.heroTitle, { color: colors.textPrimary, lineHeight: 36, marginBottom: 16 }]}>
          the leakability test.
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, lineHeight: 20, marginBottom: 28 }]}>
          10 questions based on how you actually behave online. you'll get a personalised score, a risk band, and specific things to watch out for.
        </Text>

        {/* Info chips — lavender bg per spec */}
        <View style={styles.chips}>
          {INFO_CHIPS.map((chip) => (
            <View
              key={chip.label}
              style={[styles.chip, { backgroundColor: colors.bgSecondary }]}
            >
              <Text style={{ fontSize: 12 }}>{chip.icon}</Text>
              <Text style={[type.label, { color: colors.textPrimary }]}>{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* What to expect */}
        <View style={[styles.expectCard, { backgroundColor: colors.bgSecondary, borderColor: colors.borderWeak, borderWidth: 0.5 }]}>
          <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
            what to expect
          </Text>
          {[
            'Real scenarios — not trick questions',
            'Honest feedback on every answer',
            'A score from 0 to 48 with a band',
            'A personalised learning path at the end',
          ].map((item) => (
            <View key={item} style={styles.expectRow}>
              <View style={[styles.expectDot, { backgroundColor: brand.purpleCTA }]} />
              <Text style={[type.body, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[type.bodySmall, { color: colors.textTertiary, textAlign: 'center', marginTop: 20, marginBottom: 28 }]}>
          your answers stay on your device. no data is shared.
        </Text>

        <Button
          label="Start the test"
          onPress={handleStart}
          variant="purple"
          fullWidth
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  expectCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 16,
  },
  expectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  expectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
})
