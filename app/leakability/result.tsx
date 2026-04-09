// S23 — Score Result
// Animated count-up (0 → score, 1.5s ease-out), band label, gauge bar, 3 CTAs
import { useEffect, useState, useRef } from 'react'
import { View, Text, Pressable, ScrollView, Share, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInUp,
  Easing,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { getBand } from '@/data/questions'

const BAND_DESCRIPTIONS: Record<string, string> = {
  'On Lock':
    "You dodge most scams instinctively. Your habits are solid — a few tweaks and you're bulletproof.",
  'Fast Lane':
    "You're mostly careful, but move too fast in a few situations scammers love. Easy wins ahead.",
  'Main Character':
    "You'd probably catch a scam once it's obvious — but you'd get pretty far in before noticing. Let's fix that.",
  'Loose Link':
    "Scammers would find you an easy target right now. The good news: awareness is half the battle.",
}

export default function ResultScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { score, band, bandColor } = useUserStore()

  const safeScore = score ?? 0
  const safeBand = band ?? 'Fast Lane'
  const safeColor = bandColor ?? '#5B5CF6'
  const bandData = getBand(safeScore)
  const description = BAND_DESCRIPTIONS[safeBand] ?? ''

  // ── Count-up animation (requestAnimationFrame, avoids Reanimated text quirks)
  const [displayScore, setDisplayScore] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 1500

    function frame(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(eased * safeScore))
      if (t < 1) rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [safeScore])

  // ── Gauge bar animation (fires after count-up)
  const barWidth = useSharedValue(0)
  useEffect(() => {
    barWidth.value = withDelay(
      1700,
      withTiming(safeScore / 48, { duration: 800, easing: Easing.out(Easing.ease) }),
    )
  }, [safeScore])
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value * 100}%` }))

  // ── Band label fade-in (after count-up)
  const bandOpacity = useSharedValue(0)
  useEffect(() => {
    bandOpacity.value = withDelay(1400, withTiming(1, { duration: 400 }))
  }, [])
  const bandLabelStyle = useAnimatedStyle(() => ({ opacity: bandOpacity.value }))

  async function handleShare() {
    try {
      await Share.share({
        message: `I just took the EEZ Leakability Test and scored ${safeScore}/48 — ${safeBand}. How leakable are you? #EEZ`,
      })
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32, paddingHorizontal: spacing.screenH },
        ]}
      >
        {/* ── Score section ── */}
        <View style={styles.scoreSection}>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: 8 }]}>
            your leakability score
          </Text>

          {/* Count-up number */}
          <Text
            style={{
              fontFamily: 'DMSerifDisplay_400Regular',
              fontSize: 96,
              lineHeight: 100,
              color: safeColor,
            }}
          >
            {displayScore}
          </Text>

          {/* Band label — fades in */}
          <Animated.View style={[styles.bandRow, bandLabelStyle]}>
            <View style={[styles.bandPill, { backgroundColor: safeColor }]}>
              <Text style={[type.label, { color: '#FFFFFF' }]}>{safeBand}</Text>
            </View>
            <Text style={[type.body, { color: colors.textTertiary }]}>out of 48</Text>
          </Animated.View>

          {/* Personality */}
          <Animated.Text
            entering={FadeInUp.delay(1600).duration(400)}
            style={[type.sectionHead, { color: colors.textPrimary, marginTop: 8, lineHeight: 26 }]}
          >
            {bandData.personality}
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(1800).duration(400)}
            style={[type.body, { color: colors.textSecondary, marginTop: 8, lineHeight: 20 }]}
          >
            {description}
          </Animated.Text>
        </View>

        {/* ── Risk gauge bar ── */}
        <Animated.View entering={FadeInUp.delay(1700).duration(300)}>
          <View style={[styles.gaugeCard, { backgroundColor: colors.bgSecondary }]}>
            <View style={styles.gaugeHeader}>
              <Text style={[type.meta, { color: colors.textTertiary }]}>risk level</Text>
              <Text style={[type.meta, { color: colors.textTertiary }]}>
                0 ←――――――――→ 48
              </Text>
            </View>
            {/* Track */}
            <View style={[styles.gaugeTrack, { backgroundColor: colors.bgTertiary }]}>
              {/* Fill */}
              <Animated.View
                style={[styles.gaugeFill, { backgroundColor: safeColor }, barStyle]}
              />
              {/* Band threshold markers */}
              {[12 / 48, 24 / 48, 36 / 48].map((pct, i) => (
                <View
                  key={i}
                  style={[
                    styles.gaugeMarker,
                    { left: `${pct * 100}%` as any, backgroundColor: colors.bgPrimary },
                  ]}
                />
              ))}
            </View>
            {/* Band labels */}
            <View style={styles.gaugeBandRow}>
              {['On Lock', 'Fast Lane', 'Main Character', 'Loose Link'].map((b, i) => (
                <Text
                  key={b}
                  style={[
                    type.meta,
                    {
                      flex: 1,
                      textAlign: i === 0 ? 'left' : i === 3 ? 'right' : 'center',
                      color: b === safeBand ? safeColor : colors.textTertiary,
                      fontFamily: b === safeBand ? 'Inter_700Bold' : 'Inter_600SemiBold',
                    },
                  ]}
                >
                  {b}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── CTAs ── */}
        <Animated.View entering={FadeInUp.delay(2000).duration(400)} style={styles.ctas}>
          <Pressable
            onPress={() => router.push('/leakability/breakdown')}
            style={({ pressed }) => [
              styles.ctaPrimary,
              { backgroundColor: safeColor, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[type.cardTitle, { color: '#FFFFFF' }]}>see breakdown →</Text>
          </Pressable>

          <View style={styles.ctaRow}>
            <Pressable
              onPress={() => router.push('/learn/password-glow-up')}
              style={({ pressed }) => [
                styles.ctaSecondary,
                { borderColor: colors.borderMid, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[type.body, { color: colors.textPrimary, fontFamily: 'Inter_700Bold', fontWeight: '700' }]}>
                start learning
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.ctaSecondary,
                { borderColor: colors.borderMid, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[type.body, { color: colors.textPrimary, fontFamily: 'Inter_700Bold', fontWeight: '700' }]}>
                share score
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  scoreSection: {
    marginBottom: 24,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  bandPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gaugeCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gaugeTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    marginBottom: 8,
    position: 'relative',
  },
  gaugeFill: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  gaugeMarker: {
    position: 'absolute',
    width: 2,
    height: 8,
    top: 0,
  },
  gaugeBandRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  ctas: {
    gap: 10,
  },
  ctaPrimary: {
    borderRadius: 50,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaSecondary: {
    flex: 1,
    borderRadius: 50,
    minHeight: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
