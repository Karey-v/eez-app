// S23 — Score Result
// Light mode, circular progress ring, band pill, green-to-red gauge, outline secondary CTAs
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
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { getBand } from '@/data/questions'
import { BottomNav } from '@/components/ui/BottomNav'

const RING_SIZE = 160
const RING_STROKE = 10
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CENTER = RING_SIZE / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function BandIllustration({ band, color }: { band: string; color: string }) {
  const s = 56
  const c = color
  switch (band) {
    case 'Leaky Window':
      return (
        <Svg width={s} height={s} viewBox="0 0 56 56">
          <Rect x="4" y="4" width="48" height="36" rx="3" stroke={c} strokeWidth="2.5" fill="none" />
          <Line x1="28" y1="4" x2="28" y2="40" stroke={c} strokeWidth="2" />
          <Line x1="4" y1="22" x2="52" y2="22" stroke={c} strokeWidth="2" />
          <Line x1="14" y1="40" x2="12" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="12" cy="51" r="2.5" fill={c} />
          <Line x1="28" y1="40" x2="28" y2="49" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="28" cy="52" r="2.5" fill={c} />
          <Line x1="42" y1="40" x2="44" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="44" cy="51" r="2.5" fill={c} />
        </Svg>
      )
    case 'Open Door':
      return (
        <Svg width={s} height={s} viewBox="0 0 56 56">
          <Path d="M6 52 L6 6 L50 6 L50 52" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Line x1="4" y1="52" x2="52" y2="52" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M6 6 L32 10 L32 52 L6 52 Z" stroke={c} strokeWidth="2" fill="none" />
          <Circle cx="29" cy="31" r="2.5" fill={c} />
        </Svg>
      )
    case 'Soft Lock':
      return (
        <Svg width={s} height={s} viewBox="0 0 56 56">
          <Rect x="10" y="26" width="36" height="26" rx="6" stroke={c} strokeWidth="2.5" fill="none" />
          <Path d="M18 26 L18 16 Q18 8 28 8 Q38 8 38 16 L38 22" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Circle cx="28" cy="38" r="4" stroke={c} strokeWidth="2" fill="none" />
          <Line x1="28" y1="42" x2="28" y2="47" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      )
    case 'Curtains Down':
      return (
        <Svg width={s} height={s} viewBox="0 0 56 56">
          <Line x1="4" y1="10" x2="52" y2="10" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="4" cy="10" r="3" fill={c} />
          <Circle cx="52" cy="10" r="3" fill={c} />
          <Path d="M6 10 Q4 32 18 52 L4 52" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M50 10 Q52 32 38 52 L52 52" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M18 32 Q28 38 38 32" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>
      )
    case 'On Guard':
      return (
        <Svg width={s} height={s} viewBox="0 0 56 56">
          <Path d="M28 4 L50 14 L50 30 Q50 46 28 54 Q6 46 6 30 L6 14 Z" stroke={c} strokeWidth="2.5" fill="none" />
          <Path d="M18 29 L25 36 L38 22" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )
    case 'Locked In':
      return (
        <Svg width={s} height={s} viewBox="0 0 56 56">
          <Rect x="10" y="26" width="36" height="26" rx="6" stroke={c} strokeWidth="2.5" fill="none" />
          <Path d="M18 26 L18 16 Q18 6 28 6 Q38 6 38 16 L38 26" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Circle cx="28" cy="38" r="4" stroke={c} strokeWidth="2" fill="none" />
          <Line x1="28" y1="42" x2="28" y2="47" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      )
    default:
      return null
  }
}

export default function ResultScreen() {
  const { type, spacing } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { score, band, bandColor } = useUserStore()

  const safeScore = score ?? 0
  const safeBand = band ?? 'Open Door'
  const safeColor = bandColor ?? '#5B5CF6'
  const bandData = getBand(safeScore)
  const description = bandData.description ?? ''

  // ── Count-up animation
  const [displayScore, setDisplayScore] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 1500

    function frame(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(eased * safeScore))
      if (t < 1) rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [safeScore])

  // ── Gauge bar animation
  const barWidth = useSharedValue(0)
  useEffect(() => {
    barWidth.value = withDelay(
      1700,
      withTiming(safeScore / 48, { duration: 800, easing: Easing.out(Easing.ease) }),
    )
  }, [safeScore])
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value * 100}%` }))

  // ── Band label fade-in
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

  const ringDashOffset = RING_CIRCUMFERENCE * (1 - displayScore / 48)

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40, paddingHorizontal: 24 },
        ]}
      >
        {/* ── Score section ── */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Your leakability score</Text>

          {/* Band illustration */}
          <View style={{ marginBottom: 16 }}>
            <BandIllustration band={safeBand} color={safeColor} />
          </View>

          {/* Circular progress ring */}
          <View style={styles.ringWrapper}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* Grey track */}
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke="#E5E7EB"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              {/* Band color fill arc */}
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                stroke={safeColor}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringDashOffset}
                strokeLinecap="round"
                transform={`rotate(-90, ${RING_CENTER}, ${RING_CENTER})`}
              />
            </Svg>
            <View style={styles.ringInner}>
              <Text style={[styles.scoreNumber, { color: safeColor }]}>
                {displayScore}
              </Text>
            </View>
          </View>

          {/* Band pill */}
          <Animated.View style={[styles.bandPill, { backgroundColor: safeColor + '20' }, bandLabelStyle]}>
            <Text style={[styles.bandPillText, { color: safeColor }]}>
              {safeBand.toUpperCase()}
            </Text>
          </Animated.View>

          {/* Personality title */}
          <Animated.Text
            entering={FadeInUp.delay(1600).duration(400)}
            style={styles.personalityTitle}
          >
            {bandData.personality}
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(1800).duration(400)}
            style={[type.body, { color: '#6B7280', marginTop: 10, lineHeight: 21, textAlign: 'center' }]}
          >
            {description}
          </Animated.Text>
        </View>

        {/* ── Risk gauge ── */}
        <Animated.View entering={FadeInUp.delay(1700).duration(300)} style={styles.gaugeSection}>
          <View style={styles.gaugeHeader}>
            <Text style={[type.meta, { color: '#9CA3AF' }]}>risk level</Text>
            <Text style={[type.meta, { color: '#9CA3AF' }]}>0 — 48</Text>
          </View>
          {/* Track */}
          <View style={styles.gaugeTrack}>
            {/* Green-to-red gradient fill */}
            <Animated.View style={[styles.gaugeFill, barStyle]}>
              <LinearGradient
                colors={['#22C55E', '#EF4444']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
            {/* Band threshold markers */}
            {[12 / 48, 20 / 48, 28 / 48, 36 / 48, 43 / 48].map((pct, i) => (
              <View
                key={i}
                style={[
                  styles.gaugeMarker,
                  { left: `${pct * 100}%` as any },
                ]}
              />
            ))}
          </View>
          {/* Band labels */}
          <View style={styles.gaugeBandRow}>
            {[
              { label: 'Leaky',    full: 'Leaky Window' },
              { label: 'Open',     full: 'Open Door' },
              { label: 'Soft',     full: 'Soft Lock' },
              { label: 'Curtains', full: 'Curtains Down' },
              { label: 'Guard',    full: 'On Guard' },
              { label: 'Locked',   full: 'Locked In' },
            ].map(({ label, full }, i) => (
              <Text
                key={full}
                style={[
                  type.meta,
                  {
                    flex: 1,
                    textAlign: i === 0 ? 'left' : i === 5 ? 'right' : 'center',
                    fontSize: 9,
                    color: full === safeBand ? safeColor : '#9CA3AF',
                    fontFamily: full === safeBand ? 'Inter_700Bold' : 'Inter_600SemiBold',
                  },
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
        </Animated.View>

        {/* ── CTAs ── */}
        <Animated.View entering={FadeInUp.delay(2000).duration(400)} style={styles.ctas}>
          <Pressable
            onPress={() => router.push('/leakability/breakdown')}
            style={({ pressed }) => [
              styles.ctaPrimary,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.ctaPrimaryText}>see breakdown →</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/learn/password-glow-up')}
            style={({ pressed }) => [
              styles.ctaSecondary,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.ctaSecondaryText}>start learning</Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.ctaSecondary,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.ctaSecondaryText}>share score</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="home" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
  },
  scoreSection: {
    marginBottom: 36,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 48,
    lineHeight: 52,
    textAlign: 'center',
  },
  bandPill: {
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 24,
  },
  bandPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  personalityTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    lineHeight: 30,
    color: '#0A0A0A',
    textAlign: 'center',
  },
  gaugeSection: {
    marginBottom: 36,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gaugeTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  gaugeFill: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  gaugeMarker: {
    position: 'absolute',
    width: 2,
    height: 8,
    top: 0,
    backgroundColor: '#FFFFFF',
  },
  gaugeBandRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  ctas: {
    gap: 12,
  },
  ctaPrimary: {
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B5CF6',
  },
  ctaPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  ctaSecondary: {
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#5B5CF6',
    backgroundColor: 'transparent',
  },
  ctaSecondaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#5B5CF6',
  },
})
