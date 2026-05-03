// S24 — Score Breakdown
// 5 category cards with staggered animated bars (100ms delay per card)
// Bottom: personalized path + module CTA
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowIcon } from '@/components/icons/Arrow'
import { Card } from '@/components/ui/Card'
import { BottomNav } from '@/components/ui/BottomNav'

// ─── Category config ──────────────────────────────────────────────────────────

type CategoryKey = 'passwords' | 'device' | 'messages' | 'phishing' | 'scams'

type CategoryInfo = {
  key: CategoryKey
  label: string
  min: number
  max: number
  insight: (score: number) => string
}

const CATEGORIES: CategoryInfo[] = [
  {
    key: 'passwords',
    label: 'Passwords',
    min: -3, max: 3,
    insight: (s) =>
      s >= 2
        ? 'strong password habits. unique credentials are your best defence.'
        : s >= 0
        ? 'some reuse creeping in. a password manager is a quick win.'
        : 'shared passwords are a major risk. start with a password manager today.',
  },
  {
    key: 'device',
    label: 'Device',
    min: -3, max: 3,
    insight: (s) =>
      s >= 2
        ? 'you keep your device updated. that closes a lot of doors.'
        : s >= 0
        ? 'sometimes delaying updates. they patch real vulnerabilities.'
        : 'skipping updates leaves you exposed. enable auto-updates now.',
  },
  {
    key: 'messages',
    label: 'Messages',
    min: -9, max: 9,
    insight: (s) =>
      s >= 6
        ? 'you handle suspicious messages well. verify before you trust.'
        : s >= 0
        ? 'mixed responses to suspicious messages. pause before clicking or sharing.'
        : 'messages are your weak spot. always verify the sender before acting.',
  },
  {
    key: 'phishing',
    label: 'Phishing',
    min: -6, max: 6,
    insight: (s) =>
      s >= 4
        ? 'sharp eye for phishing. you check sources before acting.'
        : s >= 0
        ? 'you spot obvious fakes but miss subtle ones. train your eye on domain names.'
        : 'phishing is working on you. a 5-second domain check changes everything.',
  },
  {
    key: 'scams',
    label: 'Scams',
    min: -7, max: 9,
    insight: (s) =>
      s >= 6
        ? 'strong scam resistance. urgency and fake rewards don\'t fool you.'
        : s >= 0
        ? 'some scam tactics catch you off guard. slow down on anything unexpected.'
        : 'urgency and fake rewards trigger your actions. scammers exploit exactly this.',
  },
]

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BreakdownScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { score, band, bandColor, categoryScores } = useUserStore()

  const safeColor = bandColor ?? '#5B5CF6'
  const cats = categoryScores ?? {
    passwords: 0, device: 0, messages: 0, phishing: 0, scams: 0,
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: spacing.screenH },
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
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: 6, marginTop: 16 }]}>
          {band?.toLowerCase()} · {score}/100
        </Text>
        <Text style={[type.heroTitle, { color: colors.textPrimary, marginBottom: 6 }]}>
          score breakdown.
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, marginBottom: 24, lineHeight: 18 }]}>
          here's how each area contributes to your overall leakability.
        </Text>

        {/* Category cards */}
        {CATEGORIES.map((cat, index) => {
          const rawScore = cats[cat.key] ?? 0
          const progress = Math.max(0, Math.min(1, (rawScore - cat.min) / (cat.max - cat.min)))
          const insight = cat.insight(rawScore)
          const scoreColor =
            rawScore >= 0
              ? rawScore >= cat.max * 0.5
                ? colors.successText
                : colors.warningText
              : colors.dangerText
          const scoreSign = rawScore > 0 ? '+' : ''

          return (
            <Animated.View
              key={cat.key}
              entering={FadeInUp.delay(index * 80).duration(300)}
              style={{ marginBottom: spacing.cardGap }}
            >
              <View
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.bgSecondary, borderColor: colors.borderWeak },
                ]}
              >
                {/* Header row */}
                <View style={styles.catHeader}>
                  <Text style={[type.cardTitle, { color: colors.textPrimary }]}>{cat.label}</Text>
                  <Text style={[type.label, { color: scoreColor }]}>
                    {scoreSign}{rawScore}
                  </Text>
                </View>

                {/* Animated bar — staggered via delay prop */}
                <ProgressBar
                  progress={progress}
                  height={6}
                  fillColor={scoreColor}
                  trackColor="rgba(255,255,255,0.1)"
                  delay={index * 100}
                  style={{ marginBottom: 10, marginTop: 10 }}
                />

                {/* Insight */}
                <Text style={[type.body, { color: colors.textSecondary, lineHeight: 18 }]}>
                  {insight}
                </Text>
              </View>
            </Animated.View>
          )
        })}

        {/* Personalized path card */}
        <Animated.View entering={FadeInUp.delay(600).duration(300)}>
          <View style={[styles.pathCard, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.label, { color: colors.textTertiary, marginBottom: 6 }]}>
              your personalized path is ready.
            </Text>
            <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>
              based on your breakdown, your first step is building stronger password habits. it takes 4 minutes.
            </Text>
          </View>
        </Animated.View>

        {/* Module preview */}
        <Animated.View entering={FadeInUp.delay(700).duration(300)} style={{ marginTop: spacing.cardGap }}>
          <Card onPress={() => router.push('/learn/password-glow-up')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 4 }]}>🔑 passwords · 4 mins</Text>
                <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 2 }]}>
                  Password Glow-Up
                </Text>
                <Text style={[type.bodySmall, { color: colors.textSecondary }]}>Beginner · 50 XP</Text>
              </View>
              <ArrowIcon size={18} color={colors.textTertiary} />
            </View>
          </Card>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(800).duration(300)} style={{ marginTop: 16 }}>
          <Pressable
            onPress={() => router.push('/learn/password-glow-up')}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: safeColor, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[type.cardTitle, { color: '#FFFFFF' }]}>start learning now →</Text>
          </Pressable>
        </Animated.View>

        {/* Home link */}
        <Animated.View entering={FadeInUp.delay(900).duration(300)} style={{ alignItems: 'center', marginTop: 16 }}>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[type.body, { color: colors.textSecondary, textDecorationLine: 'underline' }]}>
              back to home
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="home" />
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
  categoryCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  ctaButton: {
    borderRadius: 50,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
