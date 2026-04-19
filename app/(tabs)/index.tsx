// S10 — Home (first-time state) / S11 — Home (returning state)
import React from 'react'
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

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

const CATEGORY_COLORS: Record<string, string> = {
  Banks: '#22C55E',
  Jobs: '#F59E0B',
  Payments: '#EF4444',
  Identity: '#8B5CF6',
  Phishing: '#EC4899',
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
    <LinearGradient
      colors={['#4A1FD9', '#7B5FFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
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
            <Text style={[type.heroTitle, { color: '#FFFFFF' }]}>
              hey {name?.split(' ')[0]?.toLowerCase() || 'you'}.
            </Text>
          ) : (
            <EezLogo width={44} height={44} color="#FFFFFF" />
          )}
          <Pressable
            onPress={() => router.push('/notifications/')}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <BellIcon size={24} color="#FFFFFF" />
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
        <Text style={styles.heroHeadline}>So... how leakable{'\n'}are you?</Text>
        <Text style={styles.heroSubtext}>find out in 5 minutes.</Text>
        <Pressable
          onPress={() => router.push('/leakability/intro')}
          style={({ pressed }) => [styles.heroCTA, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.heroCTAText}>start the test</Text>
        </Pressable>
      </View>

      {/* Modules — 3 side-by-side mini cards */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: '#B1FF58', marginBottom: spacing.sectionBottom }]}>
          Learn something
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { emoji: '🔑', label: 'Passwords', color: '#5B5CF6', id: 'password-glow-up' },
            { emoji: '🔗', label: 'Messages', color: '#FF6B6B', id: 'link-hygiene' },
            { emoji: '📱', label: 'Device\nSafety', color: '#22D3EE', id: 'device-safety' },
          ].map((m) => (
            <Pressable
              key={m.id}
              onPress={() => router.push(`/learn/${m.id}`)}
              style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
              <Text style={styles.moduleCardLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Latest from radar */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: '#B1FF58', marginBottom: spacing.sectionBottom }]}>
          Latest from radar
        </Text>
        <View style={{ gap: 8 }}>
          {radarFeed.slice(0, 2).map((item) => {
            const catColor = CATEGORY_COLORS[item.category] ?? '#5B5CF6'
            return (
              <Card
                key={item.id}
                style={{ backgroundColor: '#FFFFFF', borderLeftWidth: 3, borderLeftColor: catColor }}
                onPress={() => router.push('/(tabs)/radar')}
              >
                <View style={styles.radarRow}>
                  <Text style={[type.label, { color: catColor }]}>
                    {item.category}
                  </Text>
                  <Text style={[type.meta, { color: colors.textTertiary, marginLeft: 'auto' as any }]}>
                    {item.timestamp}
                  </Text>
                </View>
                <Text style={[type.cardTitle, { color: colors.textPrimary, marginTop: 6 }]}>
                  {cap(item.headline)}
                </Text>
                <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4, lineHeight: 16 }]} numberOfLines={2}>
                  {item.preview}
                </Text>
              </Card>
            )
          })}
        </View>
        <Pressable
          onPress={() => router.push('/radar/report')}
          style={({ pressed }) => [styles.reportBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.reportBtnText}>report incident →</Text>
        </Pressable>
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

  return (
    <>
      {/* Score directly on gradient — no card */}
      <View style={styles.scoreSection}>
        <Text style={[styles.heroScore, { color: '#B1FF58' }]}>{score}</Text>
        <Text style={[styles.heroBandLabel, { color: '#FFFFFF' }]}>{band.toUpperCase()}</Text>
        <Text style={styles.heroPersonality}>{personality}</Text>
        <Pressable
          onPress={() => router.push('/leakability/breakdown')}
          hitSlop={12}
          style={({ pressed }) => [styles.breakdownPill, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.breakdownPillText}>tap to see breakdown →</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/leakability/intro')}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 14 })}
        >
          <Text style={styles.retakeLink}>Retake quiz</Text>
        </Pressable>
      </View>

      {/* Stats — single translucent box with pipe separators */}
      <View style={styles.statsBox}>
        {[
          { value: String(score), label: 'Out of 48' },
          { value: band.split(' ')[0], label: 'Band' },
          { value: testDate, label: 'Last test' },
        ].map((stat, i, arr) => (
          <React.Fragment key={stat.label}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.statPipe} />}
          </React.Fragment>
        ))}
      </View>

      {/* Module recommendation */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: '#B1FF58', marginBottom: spacing.sectionBottom }]}>
          Based on your score
        </Text>
        <Card style={{ backgroundColor: '#FFFFFF' }} onPress={() => router.push('/learn/password-glow-up')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.label, { color: '#5B5CF6', marginBottom: 4 }]}>🔑 Passwords</Text>
              <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 4 }]}>
                Password Glow-Up
              </Text>
              <Text style={[type.bodySmall, { color: colors.textSecondary }]}>4 mins · Beginner</Text>
            </View>
            <ArrowIcon size={18} color={colors.textTertiary} />
          </View>
        </Card>
      </View>

      {/* Modules */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: '#B1FF58', marginBottom: spacing.sectionBottom }]}>
          Learn something
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { emoji: '🔑', label: 'Passwords', id: 'password-glow-up' },
            { emoji: '🔗', label: 'Messages', id: 'link-hygiene' },
            { emoji: '📱', label: 'Device\nSafety', id: 'device-safety' },
          ].map((m) => (
            <Pressable
              key={m.id}
              onPress={() => router.push(`/learn/${m.id}`)}
              style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
              <Text style={styles.moduleCardLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Latest from radar */}
      <View style={{ marginTop: spacing.sectionTop }}>
        <Text style={[type.label, { color: '#B1FF58', marginBottom: spacing.sectionBottom }]}>
          Latest from radar
        </Text>
        <View style={{ gap: 8 }}>
          {radarFeed.slice(0, 2).map((item) => {
            const catColor = CATEGORY_COLORS[item.category] ?? '#5B5CF6'
            return (
              <Card
                key={item.id}
                style={{ backgroundColor: '#FFFFFF', borderLeftWidth: 3, borderLeftColor: catColor }}
                onPress={() => router.push('/(tabs)/radar')}
              >
                <View style={styles.radarRow}>
                  <Text style={[type.label, { color: catColor }]}>
                    {item.category}
                  </Text>
                  <Text style={[type.meta, { color: colors.textTertiary, marginLeft: 'auto' as any }]}>
                    {item.timestamp}
                  </Text>
                </View>
                <Text style={[type.cardTitle, { color: colors.textPrimary, marginTop: 6 }]}>
                  {cap(item.headline)}
                </Text>
                <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4, lineHeight: 16 }]} numberOfLines={2}>
                  {item.preview}
                </Text>
              </Card>
            )
          })}
        </View>
        <Pressable
          onPress={() => router.push('/radar/report')}
          style={({ pressed }) => [styles.reportBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.reportBtnText}>report incident →</Text>
        </Pressable>
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
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.75)',
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
  // Module mini-cards
  moduleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  moduleCardLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#0A0A0A',
    lineHeight: 16,
  },
  // Report button
  reportBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#B1FF58',
    borderRadius: 50,
  },
  reportBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1A4A00',
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
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#B1FF58',
    textAlign: 'center',
    marginTop: 6,
  },
  breakdownPill: {
    marginTop: 14,
    backgroundColor: '#B1FF58',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  breakdownPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A4A00',
  },
  // Stats — single translucent box
  statsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statPipe: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  statValue: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  retakeLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#B1FF58',
    textDecorationLine: 'underline',
  },
})
