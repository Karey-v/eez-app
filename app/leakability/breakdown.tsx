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

type CategoryKey = 'impulse' | 'habits' | 'socialPressure' | 'verification' | 'responseStyle'

type CategoryInfo = {
  key: CategoryKey
  label: string
  insight: (score: number) => string
}

const CATEGORIES: CategoryInfo[] = [
  {
    key: 'impulse',
    label: 'Impulse',
    insight: (s) =>
      s <= 2
        ? 'strong. you pause before acting — that\'s your biggest defence.'
        : s <= 4
        ? 'you sometimes act on instinct. slow down on anything unexpected.'
        : 'urgency triggers your actions. scammers exploit exactly this.',
  },
  {
    key: 'habits',
    label: 'Habits',
    insight: (s) =>
      s <= 2
        ? 'solid habits — unique passwords and careful Wi-Fi choices.'
        : s <= 4
        ? 'some risky habits creeping in. password hygiene is a quick win.'
        : 'your daily habits create unnecessary exposure. start with a password manager.',
  },
  {
    key: 'socialPressure',
    label: 'Social Pressure',
    insight: (s) =>
      s <= 2
        ? 'you verify before trusting — even people you know. smart.'
        : s <= 4
        ? 'social pressure occasionally clouds your judgement. add a verification step.'
        : 'trust in people you know is your weak spot — accounts get hacked too.',
  },
  {
    key: 'verification',
    label: 'Verification',
    insight: (s) =>
      s <= 2
        ? 'you check sources carefully. that domain awareness is valuable.'
        : s <= 4
        ? 'you spot obvious fakes but miss subtle ones. train your eye for domain names.'
        : 'you take things at face value. a 5-second domain check changes everything.',
  },
  {
    key: 'responseStyle',
    label: 'Response Style',
    insight: (s) =>
      s <= 2
        ? 'calm, deliberate responses. you don\'t panic or comply.'
        : s <= 4
        ? 'mixed responses under pressure. practice the pause-and-verify habit.'
        : 'under pressure you react fast — exactly what scammers count on.',
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
    impulse: 0, habits: 0, socialPressure: 0, verification: 0, responseStyle: 0,
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
          {band?.toLowerCase()} · {score}/48
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
          const progress = rawScore / 6 // max 6 per category
          const insight = cat.insight(rawScore)

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
                  <Text
                    style={[
                      type.label,
                      {
                        color:
                          rawScore <= 2
                            ? colors.successText
                            : rawScore <= 4
                            ? colors.warningText
                            : colors.dangerText,
                      },
                    ]}
                  >
                    {rawScore}/6
                  </Text>
                </View>

                {/* Animated bar — staggered via delay prop */}
                <ProgressBar
                  progress={progress}
                  height={6}
                  fillColor={
                    rawScore <= 2 ? colors.successText : rawScore <= 4 ? colors.warningText : colors.dangerText
                  }
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
