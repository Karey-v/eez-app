// S39 — Module Completion
// Confetti burst, badge, XP count-up, summary bullets, CTAs
import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeInUp,
} from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { useLearnStore } from '@/store/learnStore'
import { modules } from '@/data/modules'
import { badges } from '@/data/badges'
import { BottomNav } from '@/components/ui/BottomNav'

// ─── Confetti particle ────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#5B5CF6', '#602CFF', '#B1FF58', '#0A0A0A', '#FF732E', '#FFD700', '#007549']

type ParticleConfig = {
  tx: number
  ty: number
  size: number
  color: string
  delay: number
  rotate: number
}

function generateParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8
    const distance = 90 + Math.random() * 140
    return {
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 20,
      size: 6 + Math.random() * 7,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 100,
      rotate: Math.random() * 360,
    }
  })
}

const PARTICLES = generateParticles(28)

function ConfettiParticle({ config }: { config: ParticleConfig }) {
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const opacity = useSharedValue(0)
  const rotate = useSharedValue(0)

  useEffect(() => {
    const { tx, ty, delay, rotate: finalRotate } = config
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 80 }),
        withDelay(400, withTiming(0, { duration: 700 })),
      ),
    )
    x.value = withDelay(delay, withTiming(tx, { duration: 1100, easing: Easing.out(Easing.cubic) }))
    y.value = withDelay(delay, withTiming(ty, { duration: 1100, easing: Easing.out(Easing.cubic) }))
    rotate.value = withDelay(delay, withTiming(finalRotate, { duration: 1100 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: config.size,
          height: config.size,
          borderRadius: 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  )
}

// ─── Badge display ────────────────────────────────────────────────────────────

function BadgeDisplay({ icon }: { icon: string }) {
  const scale = useSharedValue(0.4)

  useEffect(() => {
    scale.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) }))
  }, [])

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <View style={styles.badgeWrapper}>
      <View style={styles.confettiContainer} pointerEvents="none">
        {PARTICLES.map((config, i) => (
          <ConfettiParticle key={i} config={config} />
        ))}
      </View>
      <Animated.View style={[styles.badgeCircle, badgeStyle]}>
        <Text style={{ fontSize: 42 }}>{icon}</Text>
      </Animated.View>
    </View>
  )
}

// ─── XP count-up ─────────────────────────────────────────────────────────────

function XPCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 900

    function frame(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * target))
      if (t < 1) rafRef.current = requestAnimationFrame(frame)
    }

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(frame)
    }, 700)

    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target])

  return (
    <View style={styles.xpRow}>
      <Text style={styles.xpNumber}>+{display}</Text>
      <Text style={styles.xpUnit}>XP</Text>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompleteScreen() {
  const { type, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>()

  const { addXP, earnBadge, incrementStreak } = useUserStore()
  const { completeModule } = useLearnStore()

  const module = modules.find((m) => m.id === moduleId)
  const badge = badges.find((b) => b.id === module?.badgeId)

  useEffect(() => {
    if (!module) return
    completeModule(moduleId)
    addXP(module.xp)
    earnBadge(module.badgeId)
    incrementStreak()
  }, [])

  if (!module || !badge) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[type.body, { color: '#5A5A5A' }]}>Loading…</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 48,
          paddingBottom: 40,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        {/* Badge with confetti */}
        <BadgeDisplay icon={badge.icon} />

        {/* Badge name */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ alignItems: 'center' }}>
          <Text style={styles.badgeUnlockedLabel}>Badge unlocked</Text>
          <Text style={styles.badgeName}>{badge.name.charAt(0).toUpperCase() + badge.name.slice(1).toLowerCase()}.</Text>
        </Animated.View>

        {/* XP counter */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <XPCounter target={module.xp} />
        </Animated.View>

        {/* Streak */}
        <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.streakChip}>
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text style={styles.streakText}>Streak extended!</Text>
        </Animated.View>

        {/* Summary card */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(400)}
          style={[styles.summaryCard, { width: '100%' }]}
        >
          <Text style={styles.summaryTitle}>What you learned</Text>
          {module.whatYoullLearn.map((item) => (
            <View key={item} style={styles.summaryRow}>
              <View style={styles.summaryDot} />
              <Text style={styles.summaryText}>{item}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTAs */}
        <Animated.View
          entering={FadeInUp.delay(1100).duration(400)}
          style={[styles.ctas, { width: '100%' }]}
        >
          {/* Locked next module */}
          <View style={styles.lockedNextCard}>
            <Text style={styles.lockedLabel}>Next module 🔒</Text>
            <Text style={styles.lockedTitle}>Link & Message Hygiene</Text>
            <Text style={styles.lockedSub}>Coming soon</Text>
          </View>

          {/* Primary CTA */}
          <Pressable
            onPress={() => router.replace('/(tabs)/learn')}
            style={({ pressed }) => [styles.ctaPrimary, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.ctaPrimaryText}>Back to learning home</Text>
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            onPress={() => router.replace('/(tabs)/profile')}
            style={({ pressed }) => [styles.ctaSecondary, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.ctaSecondaryText}>View my badges</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="learn" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  badgeWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  confettiContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  badgeUnlockedLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#9A9A9A',
    marginBottom: 6,
  },
  badgeName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 34,
    color: '#0A0A0A',
    textAlign: 'center',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    marginBottom: 8,
  },
  xpNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 56,
    lineHeight: 60,
    color: '#5B5CF6',
  },
  xpUnit: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#5B5CF6',
    marginBottom: 5,
    marginLeft: 4,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 28,
    marginTop: 4,
    backgroundColor: '#EEF0FF',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  streakText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0A0A0A',
  },
  summaryCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  summaryTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#0A0A0A',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
    backgroundColor: '#5B5CF6',
  },
  summaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#5A5A5A',
    flex: 1,
  },
  ctas: {
    gap: 12,
  },
  lockedNextCard: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  lockedLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#9A9A9A',
    marginBottom: 4,
  },
  lockedTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
    marginBottom: 2,
  },
  lockedSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#9A9A9A',
  },
  ctaPrimary: {
    borderRadius: 50,
    height: 56,
    backgroundColor: '#5B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  ctaSecondary: {
    borderRadius: 50,
    height: 56,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  ctaSecondaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#5B5CF6',
  },
})
