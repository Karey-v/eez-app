// S10 — Home (first-time state) / S11 — Home (returning state)
// Renders first-time or returning view based on userStore.score
import { useEffect } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { EezLogo } from '@/components/icons/EezLogo'
import { BellIcon } from '@/components/icons/Bell'
import { ArrowIcon } from '@/components/icons/Arrow'
import { ShieldIcon } from '@/components/icons/Shield'
import { Card } from '@/components/ui/Card'
import { radarFeed } from '@/data/radarFeed'

const BAND_PERSONALITY: Record<string, string> = {
  'On Lock':        "You're a Vault.",
  'Fast Lane':      "You're a Quick Check.",
  'Main Character': "You're an Open Book.",
  'Loose Link':     "You're a Wide Open Tab.",
}

const BAND_RANK: Record<string, number> = {
  'On Lock': 1,
  'Fast Lane': 2,
  'Main Character': 3,
  'Loose Link': 4,
}

function formatTestDate(isoString: string | null): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function HomeScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const score = useUserStore((s) => s.score)
  const band = useUserStore((s) => s.band)
  const bandColor = useUserStore((s) => s.bandColor)
  const name = useUserStore((s) => s.name)
  const lastTestDate = useUserStore((s) => s.lastTestDate)

  const hasScore = score !== null

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSecondary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* ── Top bar ── */}
        <View style={[styles.topBar, { paddingHorizontal: spacing.screenH }]}>
          {hasScore ? (
            <Text style={[type.heroTitle, { color: colors.textPrimary }]}>
              hey {name?.split(' ')[0]?.toLowerCase() || 'you'}.
            </Text>
          ) : (
            <EezLogo width={44} height={44} color={brand.purple} />
          )}
          <Pressable
            onPress={() => router.push('/notifications/')}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <BellIcon size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing.screenH, gap: spacing.cardGap }}>
          {hasScore ? (
            <ReturningView
              score={score!}
              band={band!}
              bandColor={bandColor!}
              lastTestDate={lastTestDate}
              router={router}
            />
          ) : (
            <FirstTimeView router={router} />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

// ─── First-time view (S10) ───────────────────────────────────────────────────

function FirstTimeView({ router }: { router: ReturnType<typeof useRouter> }) {
  const { spacing, brand } = useTheme()

  return (
    <>
      {/* Hero card — lime, centered score placeholder */}
      <View style={[styles.heroCard, { backgroundColor: brand.lime }]}>
        <View style={styles.heroCardInner}>
          <ShieldIcon size={48} color="#1A4A00" strokeWidth={1.5} />
          <Text style={styles.heroQuestion}>?</Text>
          <Text style={styles.heroHint}>take the test to find out</Text>
        </View>
      </View>

      {/* CTA below card */}
      <Pressable
        onPress={() => router.push('/leakability/intro')}
        style={({ pressed }) => [styles.heroCTA, { opacity: pressed ? 0.88 : 1 }]}
      >
        <Text style={styles.heroCTAText}>take the test</Text>
      </Pressable>

      {/* AI Fraud Detector */}
      <FraudDetectorCard router={router} />

      {/* Latest radar snippet */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[{ fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' as const }, { color: '#9A9A9A', marginBottom: spacing.sectionBottom }]}>
          latest from radar
        </Text>
        <Card onPress={() => router.push('/(tabs)/radar')} style={styles.radarSnippet}>
          <View style={styles.radarRow}>
            <View style={[styles.categoryDot, { backgroundColor: '#5B5CF6' }]} />
            <Text style={[{ fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' as const }, { color: '#5B5CF6' }]}>phishing</Text>
            <Text style={[{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9A9A9A' }, { marginLeft: 'auto' as any }]}>
              {radarFeed[0].timestamp}
            </Text>
          </View>
          <Text style={[{ fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 21 }, { color: '#0A0A0A', marginTop: 6 }]}>
            {radarFeed[0].headline}
          </Text>
          <Text style={[{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 }, { color: '#5A5A5A', marginTop: 4, lineHeight: 16 }]} numberOfLines={2}>
            {radarFeed[0].preview}
          </Text>
        </Card>
      </View>
    </>
  )
}

// ─── Returning view (S11) ────────────────────────────────────────────────────

function BandIllustration({ band }: { band: string }) {
  const stroke = 'rgba(255,255,255,0.9)'
  const sw = 1.5
  const size = 44

  if (band === 'On Lock') {
    return (
      <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <Rect x={8} y={22} width={28} height={18} rx={4} stroke={stroke} strokeWidth={sw} />
        <Path
          d="M13 22V17C13 9 31 9 31 17V22"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={22} cy={31} r={3} stroke={stroke} strokeWidth={sw} />
      </Svg>
    )
  }

  if (band === 'Fast Lane') {
    return (
      <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <Path
          d="M25 4L11 24H21L19 40L33 20H23L25 4Z"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    )
  }

  if (band === 'Main Character') {
    return (
      <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <Path
          d="M22 4L25.5 14H36L27.5 20L30.5 30L22 24L13.5 30L16.5 20L8 14H18.5L22 4Z"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    )
  }

  // Loose Link — two chain ovals offset
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Path
        d="M4 18C4 13 8 10 13 10H20C25 10 29 13 29 18C29 23 25 26 20 26H13C8 26 4 23 4 18Z"
        stroke={stroke}
        strokeWidth={sw}
      />
      <Path
        d="M15 26C15 21 19 18 24 18H31C36 18 40 21 40 26C40 31 36 34 31 34H24C19 34 15 31 15 26Z"
        stroke={stroke}
        strokeWidth={sw}
      />
    </Svg>
  )
}

function ReturningView({
  score,
  band,
  bandColor,
  lastTestDate,
  router,
}: {
  score: number
  band: string
  bandColor: string
  lastTestDate: string | null
  router: ReturnType<typeof useRouter>
}) {
  const { colors, type, spacing } = useTheme()

  const personality = BAND_PERSONALITY[band] ?? ''
  const rank = BAND_RANK[band] ?? '—'
  const testDate = formatTestDate(lastTestDate)

  const quickActions = [
    { label: 'retake test', onPress: () => router.push('/leakability/intro') },
    { label: 'continue learning', onPress: () => router.push('/(tabs)/learn') },
    { label: 'see radar', onPress: () => router.push('/(tabs)/radar') },
    { label: 'safety check', onPress: () => router.push('/safety-modal') },
  ]

  return (
    <>
      {/* Score card */}
      <Pressable
        onPress={() => router.push('/leakability/breakdown')}
        style={({ pressed }) => [
          styles.scoreCard,
          { backgroundColor: bandColor, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <View style={styles.scoreRow}>
          <BandIllustration band={band} />
          <View style={styles.scoreCenter}>
            <Text style={styles.scoreBig}>{score}</Text>
            <Text style={styles.scoreBandLabel}>{band.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.scorePersonality}>{personality}</Text>
        <Text style={styles.scoreTapHint}>tap to see full breakdown →</Text>
      </Pressable>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.bgPrimary }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{score}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>out of 48</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgPrimary }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>#{rank}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>band rank</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgPrimary }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{testDate}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>last tested</Text>
        </View>
      </View>

      {/* AI Fraud Detector */}
      <FraudDetectorCard router={router} />

      {/* Quick actions */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          quick actions
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -14 }} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.quickActionCard,
                { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[type.body, { color: colors.textPrimary }]}>{action.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Module recommendation */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          based on your score, start here
        </Text>
        <Card onPress={() => router.push('/learn/password-glow-up')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: '#5B5CF6', marginBottom: 4 }]}>🔑 passwords</Text>
              <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 4 }]}>
                Password Glow-Up
              </Text>
              <Text style={[type.bodySmall, { color: colors.textSecondary }]}>4 mins · Beginner</Text>
            </View>
            <ArrowIcon size={18} color={colors.textTertiary} />
          </View>
        </Card>
      </View>
    </>
  )
}

// ─── AI Fraud Detector card ──────────────────────────────────────────────────

function HomePulseDot() {
  const scale = useSharedValue(1)
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      false,
    )
  }, [])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View
      style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#B1FF58' }, style]}
    />
  )
}

function FraudDetectorCard({ router }: { router: ReturnType<typeof useRouter> }) {
  const { type, brand } = useTheme()
  return (
    <Pressable
      onPress={() => router.push('/safety/detector')}
      style={({ pressed }) => [
        styles.detectorCard,
        { backgroundColor: brand.darkGreen, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.detectorTopRow}>
        <View style={styles.detectorOnlineRow}>
          <HomePulseDot />
          <Text style={[type.label, { color: '#9FE8C4', marginLeft: 6 }]}>online</Text>
        </View>
        <ArrowIcon size={16} color="#9FE8C4" />
      </View>
      <Text style={[type.sectionHead, { color: '#FFFFFF', marginBottom: 6 }]}>
        EEZ Fraud Detector
      </Text>
      <Text style={[type.body, { color: '#9FE8C4', lineHeight: 18 }]}>
        paste a message, email, or describe a situation — we'll tell you if something's off.
      </Text>
      <Text style={[type.label, { color: '#B1FF58', marginTop: 14 }]}>try it now →</Text>
    </Pressable>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  // First-time
  heroCard: {
    borderRadius: 20,
    padding: 24,
  },
  heroCardInner: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  heroQuestion: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '400',
    color: '#1A4A00',
  },
  heroHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#2D6A00',
  },
  heroCTA: {
    backgroundColor: '#5B5CF6',
    borderRadius: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCTAText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  radarSnippet: {},
  radarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Returning
  scoreCard: {
    borderRadius: 16,
    padding: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreCenter: {
    flex: 1,
    alignItems: 'center',
  },
  scoreBig: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 72,
    lineHeight: 80,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  scoreBandLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  scorePersonality: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  scoreTapHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    fontWeight: '400',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  quickActionCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  detectorCard: {
    borderRadius: 14,
    padding: 16,
  },
  detectorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detectorOnlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
