// S39 — Module Completion
// Confetti burst, badge with glow ring, XP count-up, summary bullets, CTAs
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

// ─── Confetti particle ────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#5B5CF6', '#B8F04A', '#FF732E', '#007549', '#602CFF', '#D2D9FF', '#FFD700']

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

// ─── Badge with glow ring ─────────────────────────────────────────────────────

function BadgeDisplay({ icon, color }: { icon: string; color: string }) {
  const scale = useSharedValue(0.4)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) }))
    glowOpacity.value = withDelay(600, withTiming(1, { duration: 400 }))
  }, [])

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  return (
    <View style={styles.badgeWrapper}>
      {/* Confetti burst — centered on badge */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {PARTICLES.map((config, i) => (
          <ConfettiParticle key={i} config={config} />
        ))}
      </View>

      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          { borderColor: color, backgroundColor: `${color}22` },
          glowStyle,
        ]}
      />

      {/* Badge circle */}
      <Animated.View
        style={[styles.badgeCircle, { backgroundColor: color }, badgeStyle]}
      >
        <Text style={{ fontSize: 38 }}>{icon}</Text>
      </Animated.View>
    </View>
  )
}

// ─── XP count-up ─────────────────────────────────────────────────────────────

function XPCounter({ target }: { target: number }) {
  const { colors, brand } = useTheme()
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

    // Delay start to let badge animation play first
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
      <Text
        style={{
          fontFamily: 'DMSerifDisplay_400Regular',
          fontSize: 52,
          lineHeight: 56,
          color: brand.purpleCTA,
        }}
      >
        +{display}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 20,
          color: brand.purpleCTA,
          alignSelf: 'flex-end',
          marginBottom: 6,
          marginLeft: 4,
        }}
      >
        XP
      </Text>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompleteScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>()

  const { addXP, earnBadge, incrementStreak } = useUserStore()
  const { completeModule } = useLearnStore()

  const module = modules.find((m) => m.id === moduleId)
  const badge = badges.find((b) => b.id === module?.badgeId)

  // Mark complete on mount (idempotent — completeModule checks for duplicates)
  useEffect(() => {
    if (!module) return
    completeModule(moduleId)
    addXP(module.xp)
    earnBadge(module.badgeId)
    incrementStreak()
  }, [])

  if (!module || !badge) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[type.body, { color: colors.textSecondary }]}>Loading…</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
          alignItems: 'center',
        }}
      >
        {/* Badge with confetti */}
        <BadgeDisplay icon={badge.icon} color={badge.color} />

        {/* Badge name */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ alignItems: 'center' }}>
          <Text style={[type.label, { color: colors.textTertiary, marginTop: 20, marginBottom: 4 }]}>
            badge unlocked
          </Text>
          <Text style={[type.heroTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
            {badge.name.toLowerCase()}.
          </Text>
        </Animated.View>

        {/* XP counter */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <XPCounter target={module.xp} />
        </Animated.View>

        {/* Streak */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(400)}
          style={[styles.streakChip, { backgroundColor: colors.bgSecondary }]}
        >
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text style={[type.cardTitle, { color: colors.textPrimary }]}>streak extended!</Text>
        </Animated.View>

        {/* Summary card */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(400)}
          style={[styles.summaryCard, { backgroundColor: colors.bgSecondary, width: '100%' }]}
        >
          <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
            what you learned
          </Text>
          {module.whatYoullLearn.map((item) => (
            <View key={item} style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: badge.color }]} />
              <Text style={[type.body, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
                {item}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* CTAs */}
        <Animated.View
          entering={FadeInUp.delay(1100).duration(400)}
          style={[styles.ctas, { width: '100%' }]}
        >
          {/* Next module — locked */}
          <View style={[styles.lockedNextCard, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.label, { color: colors.textTertiary, marginBottom: 4 }]}>
              next module 🔒
            </Text>
            <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 2 }]}>
              Link & Message Hygiene
            </Text>
            <Text style={[type.bodySmall, { color: colors.textTertiary }]}>coming soon</Text>
          </View>

          <Pressable
            onPress={() => router.replace('/(tabs)/learn')}
            style={({ pressed }) => [
              styles.homeBtn,
              { backgroundColor: brand.purpleCTA, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[type.cardTitle, { color: '#FFFFFF' }]}>back to learning home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  badgeWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
  },
  badgeCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
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
  },
  summaryCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  ctas: {
    gap: 10,
  },
  lockedNextCard: {
    borderRadius: 14,
    padding: 14,
  },
  homeBtn: {
    borderRadius: 50,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
})
