// S51 — Step-by-Step Guide (post scenario, fully interactive)
// 6 steps with checkboxes, progress bar, action buttons, end state card
import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
} from 'react-native'
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { ArrowIcon } from '@/components/icons/Arrow'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BottomNav } from '@/components/ui/BottomNav'

// ─── Steps data ───────────────────────────────────────────────────────────────

type StepAction = {
  label: string
  url?: string
  route?: string
}

type Step = {
  title: string
  body: string
  action?: StepAction
}

const POST_STEPS: Step[] = [
  {
    title: 'Secure your accounts',
    body: 'Change passwords on any accounts that may be affected — start with your email. Enable two-factor authentication wherever possible. Use a password manager if you aren\'t already.',
  },
  {
    title: 'Check your credit',
    body: 'Request a free credit report to check whether any accounts have been opened in your name without your knowledge.',
    action: { label: 'Check your credit →', url: 'https://www.annualcreditreport.com' },
  },
  {
    title: 'Freeze your credit',
    body: 'A credit freeze stops fraudsters from opening new accounts in your name. It\'s free, instant, and can be lifted at any time.',
    action: { label: 'See all helplines →', route: '/safety/helplines' },
  },
  {
    title: 'File an FTC report',
    body: 'The FTC collects fraud reports and uses them to build cases against scammers. Your report helps protect others — even if you can\'t get money back.',
    action: { label: 'Report to FTC →', url: 'https://reportfraud.ftc.gov' },
  },
  {
    title: 'File with FBI IC3',
    body: 'If significant money or personal data was lost, file with the FBI\'s Internet Crime Complaint Center. This creates an official federal record.',
    action: { label: 'File with FBI IC3 →', url: 'https://www.ic3.gov' },
  },
  {
    title: 'Talk to someone',
    body: 'Being scammed can be stressful and isolating — it is not your fault. Crisis Text Line offers free, confidential support 24/7.',
    action: { label: 'Text HOME to 741741', url: 'sms:741741' },
  },
]

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  const { colors, brand } = useTheme()
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={[
        styles.checkbox,
        {
          backgroundColor: checked ? brand.purpleCTA : 'transparent',
          borderColor: checked ? brand.purpleCTA : colors.borderWeak,
        },
      ]}
    >
      {checked && (
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_700Bold' }}>✓</Text>
      )}
    </Pressable>
  )
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  checked,
  onToggle,
}: {
  step: Step
  index: number
  checked: boolean
  onToggle: () => void
}) {
  const { colors, type, brand } = useTheme()
  const router = useRouter()

  async function handleAction(action: StepAction) {
    if (action.route) {
      router.push(action.route as any)
    } else if (action.url) {
      try {
        await Linking.openURL(action.url)
      } catch {}
    }
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(300)}
      style={[
        styles.stepCard,
        {
          backgroundColor: colors.bgPrimary,
          borderColor: checked ? brand.purpleCTA : colors.borderWeak,
          borderWidth: checked ? 1 : 0.5,
          opacity: checked ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.stepHeader}>
        {/* Step number */}
        <View style={[styles.stepNumber, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[type.cardTitle, { color: colors.textPrimary }]}>
            {index + 1}
          </Text>
        </View>

        <Text style={[type.cardTitle, { color: colors.textPrimary, flex: 1 }]}>
          {step.title}
        </Text>

        <Checkbox checked={checked} onToggle={onToggle} />
      </View>

      <Text
        style={[
          type.body,
          { color: colors.textSecondary, lineHeight: 18, marginTop: 10, marginLeft: 40 },
        ]}
      >
        {step.body}
      </Text>

      {step.action && (
        <Pressable
          onPress={() => handleAction(step.action!)}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              borderColor: colors.borderMid,
              opacity: pressed ? 0.7 : 1,
              marginTop: 10,
              marginLeft: 40,
            },
          ]}
        >
          <Text style={[type.body, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
            {step.action.label}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GuideScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { scenario } = useLocalSearchParams<{ scenario: string }>()

  const [checked, setChecked] = useState<boolean[]>(POST_STEPS.map(() => false))
  const checkedCount = checked.filter(Boolean).length
  const allDone = checkedCount === POST_STEPS.length

  // Only "post" scenario is built; other scenarios show coming soon
  if (scenario !== 'post') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + 16,
          paddingHorizontal: spacing.screenH,
        }}
      >
        <StatusBar style="dark" />
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>
        <Text style={[type.heroTitle, { color: colors.textPrimary, marginTop: 24 }]}>coming soon.</Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>
          this guide is being built. check back soon.
        </Text>
      </View>
    )
  }

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />

      {/* Fixed header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            paddingHorizontal: spacing.screenH,
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.borderWeak,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: 6 }]}>
            step {checkedCount} of {POST_STEPS.length}
          </Text>
          <ProgressBar
            progress={checkedCount / POST_STEPS.length}
            height={2}
            fillColor={brand.purpleCTA}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Title */}
        <Text
          style={[
            type.heroTitle,
            { color: '#5B5CF6', lineHeight: 34, marginBottom: 6 },
          ]}
        >
          You're not alone.
        </Text>
        <Text
          style={[
            type.body,
            { color: colors.textSecondary, lineHeight: 18, marginBottom: 24 },
          ]}
        >
          here's what to do next — take it one step at a time.
        </Text>

        {/* Steps */}
        {POST_STEPS.map((step, i) => (
          <View key={i} style={{ marginBottom: spacing.cardGap }}>
            <StepCard
              step={step}
              index={i}
              checked={checked[i]}
              onToggle={() => toggle(i)}
            />
          </View>
        ))}

        {/* End state — appears when all done */}
        {allDone && (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={[styles.endCard, { backgroundColor: colors.bgSecondary }]}
          >
            <Text style={{ fontSize: 28, marginBottom: 10 }}>🛡️</Text>
            <Text style={[type.cardTitle, { color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }]}>
              fraud recovery takes time.
            </Text>
            <Text
              style={[
                type.body,
                { color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
              ]}
            >
              every step you take matters. you've done the hard part.
            </Text>

            <Pressable
              onPress={() => router.push('/safety/helplines')}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[type.body, { color: brand.purpleCTA, fontFamily: 'Inter_700Bold', textDecorationLine: 'underline' }]}>
                see all helplines
              </Text>
            </Pressable>

            <View style={{ marginTop: 8 }}>
              <Pressable
                onPress={() => router.push('/safety/detector')}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={[type.body, { color: colors.textSecondary, textDecorationLine: 'underline' }]}>
                  talk to the fraud detector
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      <BottomNav activeTab="home" />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepCard: {
    borderRadius: 14,
    padding: 14,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionBtn: {
    borderRadius: 50,
    minHeight: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  endCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
})
