// S10 — Home (first-time state) / S11 — Home (returning state)
// Renders first-time or returning view based on userStore.score
import { useEffect } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
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
import { ShieldIcon } from '@/components/icons/Shield'
import { LearnIcon } from '@/components/icons/Learn'
import { RadarIcon } from '@/components/icons/Radar'
import { ArrowIcon } from '@/components/icons/Arrow'
import { Card } from '@/components/ui/Card'
import { radarFeed } from '@/data/radarFeed'

export default function HomeScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { score, band, bandColor, name } = useUserStore()

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
          {hasScore ? <ReturningView score={score!} band={band!} bandColor={bandColor!} router={router} /> : <FirstTimeView router={router} />}
        </View>
      </ScrollView>
    </View>
  )
}

// ─── First-time view (S10) ───────────────────────────────────────────────────

function FirstTimeView({ router }: { router: ReturnType<typeof useRouter> }) {
  const { colors, type, spacing, brand } = useTheme()

  return (
    <>
      {/* Hero card */}
      <Pressable
        onPress={() => router.push('/leakability/intro')}
        style={({ pressed }) => [
          styles.heroCard,
          { backgroundColor: brand.purple, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <Text style={[type.label, { color: 'rgba(255,255,255,0.7)', marginBottom: 10 }]}>
          your risk score
        </Text>
        <Text style={[type.screenTitle, { color: '#FFFFFF', lineHeight: 30, marginBottom: 6 }]}>
          so... how leakable{'\n'}are you?
        </Text>
        <Text style={[type.body, { color: 'rgba(255,255,255,0.75)', marginBottom: 20, lineHeight: 18 }]}>
          1 in 3 Gen Zers have been scammed online. take the 5-min test and find out where you stand.
        </Text>
        <View style={styles.limeButton}>
          <Text style={[type.cardTitle, { color: '#1A4A00' }]}>take the test</Text>
          <ArrowIcon size={14} color="#1A4A00" />
        </View>
      </Pressable>

      {/* AI Fraud Detector */}
      <FraudDetectorCard router={router} />

      {/* 3-feature row */}
      <View style={styles.featureRow}>
        <FeatureTile
          icon={<ShieldIcon size={24} color={brand.purpleCTA} />}
          label="know your risk"
        />
        <FeatureTile
          icon={<LearnIcon size={24} color={brand.purpleCTA} />}
          label="learn to protect"
        />
        <FeatureTile
          icon={<RadarIcon size={24} color={brand.purpleCTA} />}
          label="stay on radar"
        />
      </View>

      {/* Latest radar snippet */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          latest from radar
        </Text>
        <Card onPress={() => router.push('/(tabs)/radar')} style={styles.radarSnippet}>
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

function ReturningView({
  score,
  band,
  bandColor,
  router,
}: {
  score: number
  band: string
  bandColor: string
  router: ReturnType<typeof useRouter>
}) {
  const { colors, type, spacing } = useTheme()

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
        <Text style={[type.label, { color: 'rgba(255,255,255,0.7)', marginBottom: 4 }]}>
          your leakability score
        </Text>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 64, color: '#FFFFFF', lineHeight: 72 }}>
          {score}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Text style={[type.cardTitle, { color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.6 }]}>
            {band}
          </Text>
          <View style={styles.outOf}>
            <Text style={[type.bodySmall, { color: 'rgba(255,255,255,0.6)' }]}>out of 48</Text>
          </View>
        </View>
        <Text style={[type.bodySmall, { color: 'rgba(255,255,255,0.65)', marginTop: 12 }]}>
          tap to see full breakdown →
        </Text>
      </Pressable>

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function FeatureTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { colors, type } = useTheme()
  return (
    <View style={[styles.featureTile, { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak }]}>
      {icon}
      <Text style={[type.label, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
        {label}
      </Text>
    </View>
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
  heroCard: {
    borderRadius: 16,
    padding: 20,
  },
  limeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#B8F04A',
    borderRadius: 50,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
  },
  featureTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    alignItems: 'center',
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
  scoreCard: {
    borderRadius: 16,
    padding: 20,
  },
  outOf: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
