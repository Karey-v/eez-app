// S10 — Home (first-time state) / S11 — Home (returning state)
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { EezLogo } from '@/components/icons/EezLogo'
import { BellIcon } from '@/components/icons/Bell'
import { ArrowIcon } from '@/components/icons/Arrow'
import { Card } from '@/components/ui/Card'
import { radarFeed } from '@/data/radarFeed'
import { modules } from '@/data/modules'

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
    <LinearGradient
      colors={['#EEF0FF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.42 }}
      style={{ flex: 1 }}
    >
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
    </LinearGradient>
  )
}

// ─── First-time view (S10) ───────────────────────────────────────────────────

function FirstTimeView({ router }: { router: ReturnType<typeof useRouter> }) {
  const { spacing, type, colors, brand } = useTheme()

  return (
    <>
      {/* Hero — headline + button directly on gradient */}
      <View style={styles.heroSection}>
        <Text style={styles.heroHeadline}>so... how leakable{'\n'}are you?</Text>
        <Text style={styles.heroSubtext}>find out in 5 minutes.</Text>
        <Pressable
          onPress={() => router.push('/leakability/intro')}
          style={({ pressed }) => [styles.heroCTA, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.heroCTAText}>start the test</Text>
        </Pressable>
      </View>

      {/* Modules */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          learn something
        </Text>
        <View style={{ gap: 8 }}>
          {modules.map((m) => (
            <Card
              key={m.id}
              style={{ backgroundColor: '#FFFFFF' }}
              onPress={m.locked ? undefined : () => router.push(`/learn/${m.id}`)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 4 }]}>{m.tag}</Text>
                  <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 4 }]}>{m.title}</Text>
                  <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
                    {m.duration} · {m.difficulty}{m.locked ? ' · coming soon' : ''}
                  </Text>
                </View>
                {m.locked ? (
                  <Text style={{ fontSize: 14 }}>🔒</Text>
                ) : (
                  <ArrowIcon size={18} color={colors.textTertiary} />
                )}
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Latest from radar */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          latest from radar
        </Text>
        <View style={{ gap: 8 }}>
          {radarFeed.slice(0, 2).map((item) => (
            <Card
              key={item.id}
              style={{ backgroundColor: '#FFFFFF' }}
              onPress={() => router.push('/(tabs)/radar')}
            >
              <View style={styles.radarRow}>
                <View style={[styles.categoryDot, { backgroundColor: brand.purpleCTA }]} />
                <Text style={[type.label, { color: brand.purpleCTA }]}>
                  {item.category.toLowerCase()}
                </Text>
                <Text style={[type.meta, { color: colors.textTertiary, marginLeft: 'auto' as any }]}>
                  {item.timestamp}
                </Text>
              </View>
              <Text style={[type.cardTitle, { color: colors.textPrimary, marginTop: 6 }]}>
                {item.headline}
              </Text>
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4, lineHeight: 16 }]} numberOfLines={2}>
                {item.preview}
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </>
  )
}

// ─── Returning view (S11) ────────────────────────────────────────────────────

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
      {/* Score directly on gradient — no card */}
      <View style={styles.scoreSection}>
        <Text style={[styles.heroScore, { color: bandColor }]}>{score}</Text>
        <Text style={[styles.heroBandLabel, { color: bandColor }]}>{band.toUpperCase()}</Text>
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
        {[
          { value: String(score), label: 'out of 48', valueColor: colors.textPrimary },
          { value: band.split(' ')[0], label: 'band', valueColor: bandColor },
          { value: testDate, label: 'last test', valueColor: colors.textPrimary },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: '#FFFFFF', borderColor: colors.borderWeak }]}
          >
            <Text style={[styles.statValue, { color: stat.valueColor }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

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
                  backgroundColor: colors.bgTertiary,
                  borderColor: colors.borderWeak,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[type.body, { color: '#5B5CF6' }]}>{action.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Module recommendation */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: spacing.sectionBottom }]}>
          based on your score, start here
        </Text>
        <Card style={{ backgroundColor: '#FFFFFF' }} onPress={() => router.push('/learn/password-glow-up')}>
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  // First-time hero
  heroSection: {
    paddingTop: 28,
    paddingBottom: 36,
    alignItems: 'center',
  },
  heroHeadline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '400',
    color: '#0A0A0A',
    textAlign: 'center',
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#5A5A5A',
    textAlign: 'center',
    marginTop: 10,
  },
  heroCTA: {
    backgroundColor: '#B1FF58',
    borderRadius: 50,
    height: 48,
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  heroCTAText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#1A4A00',
  },
  // Radar row
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
  // Returning — score on gradient
  scoreSection: {
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroScore: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 72,
    lineHeight: 80,
    fontWeight: '400',
  },
  heroBandLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  heroPersonality: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A5A5A',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  heroBreakdownLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#9A9A9A',
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
})
