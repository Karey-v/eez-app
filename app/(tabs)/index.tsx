// S10 — Home (first-time state) / S11 — Home (returning state)
// Renders first-time or returning view based on userStore.score
import { useEffect } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg'
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

// ─── Hero radial gradient — radiates from top center ────────────────────────

function HeroGradient({ style }: { style: any }) {
  return (
    <View style={style} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="0%" r="100%">
            <Stop offset="0%" stopColor="#7828FF" stopOpacity="0.95" />
            <Stop offset="35%" stopColor="#4a1a99" stopOpacity="0.7" />
            <Stop offset="65%" stopColor="#1a0533" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#0a0a0a" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bg)" />
      </Svg>
    </View>
  )
}

const BAND_PERSONALITY: Record<string, string> = {
  'On Lock':        "You're a Vault.",
  'Fast Lane':      "You're a Quick Check.",
  'Main Character': "You're an Open Book.",
  'Loose Link':     "You're a Wide Open Tab.",
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
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
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
  const { spacing, brand, type, colors } = useTheme()

  return (
    <>
      {/* Hero section — unboxed, directly on dark bg */}
      <View style={styles.heroSection}>
        <HeroGradient style={styles.firstTimeGlow} />
        <Text style={styles.heroHeadline}>so... how leakable are you?</Text>
        <Text style={styles.heroSubtext}>find out in 5 minutes.</Text>
        <View style={{ height: 24 }} />
        <Pressable
          onPress={() => router.push('/leakability/intro')}
          style={({ pressed }) => [styles.heroCTA, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.heroCTAText}>start the test</Text>
        </Pressable>
      </View>

      {/* AI Fraud Detector */}
      <FraudDetectorCard router={router} />

      {/* Latest radar snippet */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          latest from radar
        </Text>
        <Card onPress={() => router.push('/(tabs)/radar')}>
          <View style={styles.radarRow}>
            <View style={[styles.categoryDot, { backgroundColor: brand.purpleCTA }]} />
            <Text style={[type.label, { color: brand.purpleCTA }]}>phishing</Text>
            <Text style={[type.meta, { color: colors.textTertiary, marginLeft: 'auto' as any }]}>
              {radarFeed[0].timestamp}
            </Text>
          </View>
          <Text style={[type.cardTitle, { color: colors.textPrimary, marginTop: 6 }]}>
            {radarFeed[0].headline}
          </Text>
          <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4, lineHeight: 16 }]} numberOfLines={2}>
            {radarFeed[0].preview}
          </Text>
        </Card>
      </View>
    </>
  )
}

// ─── Returning view (S11) ────────────────────────────────────────────────────

function BandIllustration({ band }: { band: string }) {
  const stroke = 'rgba(255,255,255,0.85)'
  const sw = 1.5
  const size = 44

  if (band === 'On Lock') {
    return (
      <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <Rect x={8} y={22} width={28} height={18} rx={4} stroke={stroke} strokeWidth={sw} />
        <Path
          d="M13 22V17C13 9 31 9 31 17V22"
          stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
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
          stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        />
      </Svg>
    )
  }
  if (band === 'Main Character') {
    return (
      <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <Path
          d="M22 4L25.5 14H36L27.5 20L30.5 30L22 24L13.5 30L16.5 20L8 14H18.5L22 4Z"
          stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        />
      </Svg>
    )
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Path d="M4 18C4 13 8 10 13 10H20C25 10 29 13 29 18C29 23 25 26 20 26H13C8 26 4 23 4 18Z" stroke={stroke} strokeWidth={sw} />
      <Path d="M15 26C15 21 19 18 24 18H31C36 18 40 21 40 26C40 31 36 34 31 34H24C19 34 15 31 15 26Z" stroke={stroke} strokeWidth={sw} />
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
  const testDate = formatTestDate(lastTestDate)

  const quickActions = [
    { label: 'retake test', onPress: () => router.push('/leakability/intro') },
    { label: 'continue learning', onPress: () => router.push('/(tabs)/learn') },
    { label: 'see radar', onPress: () => router.push('/(tabs)/radar') },
    { label: 'safety check', onPress: () => router.push('/safety-modal') },
  ]

  return (
    <>
      {/* Hero area — unboxed, score on dark bg with lime glow */}
      <View style={styles.heroArea}>
        <HeroGradient style={styles.returningGlow} />
        <Text style={[styles.heroScore, { color: bandColor }]}>{score}</Text>
        <Text style={styles.heroBandLabel}>{band.toUpperCase()}</Text>
        <Text style={styles.heroPersonality}>{personality}</Text>
        <Pressable
          onPress={() => router.push('/leakability/breakdown')}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: 12 })}
        >
          <Text style={styles.heroBreakdownLink}>tap to see breakdown →</Text>
        </Pressable>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{score}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>out of 48</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.statValue, { color: bandColor }]}>{band.split(' ')[0]}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>band</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{testDate}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>last test</Text>
        </View>
      </View>

      {/* AI Fraud Detector */}
      <FraudDetectorCard router={router} />

      {/* Quick actions */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          quick actions
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -spacing.screenH }}
          contentContainerStyle={{ paddingHorizontal: spacing.screenH, gap: 8 }}
        >
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.borderWeak,
                  opacity: pressed ? 0.7 : 1,
                },
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
  const { type, colors } = useTheme()
  return (
    <Pressable
      onPress={() => router.push('/safety/detector')}
      style={({ pressed }) => [
        styles.detectorCard,
        { backgroundColor: colors.bgSecondary, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.detectorTopRow}>
        <View style={styles.detectorOnlineRow}>
          <HomePulseDot />
          <Text style={[type.label, { color: '#4ADE80', marginLeft: 6 }]}>online</Text>
        </View>
        <ArrowIcon size={16} color={colors.textTertiary} />
      </View>
      <Text style={[type.sectionHead, { color: colors.textPrimary, marginBottom: 6 }]}>
        EEZ Fraud Detector
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, lineHeight: 18 }]}>
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
  heroSection: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  firstTimeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
  },
  heroHeadline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 12,
  },
  heroCTA: {
    backgroundColor: '#5B5CF6',
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  heroCTAText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
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
  // Returning — hero area
  heroArea: {
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  returningGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
  },
  heroScore: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 80,
    lineHeight: 88,
    fontWeight: '400',
    marginTop: 8,
  },
  heroBandLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#AAAAAA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  heroPersonality: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#AAAAAA',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  heroBreakdownLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#666666',
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    fontWeight: '400',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
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
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
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
