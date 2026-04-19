// S48 — Safety Home
// 3 scenario cards, AI Fraud Detector card (dark green + pulse dot), helplines mini section
import { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { ShieldIcon } from '@/components/icons/Shield'
import { ArrowIcon } from '@/components/icons/Arrow'

// ─── Pulse dot ────────────────────────────────────────────────────────────────

function PulseDot({ color = '#B1FF58', size = 8 }: { color?: string; size?: number }) {
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
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  )
}

// ─── Scenario card ────────────────────────────────────────────────────────────

function ScenarioCard({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  disabled,
}: {
  icon: string
  iconBg: string
  title: string
  subtitle?: string
  onPress?: () => void
  disabled?: boolean
}) {
  const { colors, type } = useTheme()

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.scenarioCard,
        {
          backgroundColor: '#FFFFFF',
          borderColor: colors.borderWeak,
          opacity: pressed && !disabled ? 0.85 : disabled ? 0.45 : 1,
        },
      ]}
    >
      <View style={[styles.scenarioIcon, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: subtitle ? 2 : 0 }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[type.bodySmall, { color: colors.textTertiary }]}>{subtitle}</Text>
        )}
      </View>
      <ArrowIcon size={16} color={disabled ? colors.textTertiary : colors.textSecondary} />
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SafetyScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSecondary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <ShieldIcon size={22} color={brand.purpleCTA} />
          <Text style={[type.heroTitle, { color: '#5B5CF6', marginLeft: 8 }]}>
            Safety network.
          </Text>
        </View>
        <Text style={[type.body, { color: colors.textSecondary, marginBottom: 24, lineHeight: 18 }]}>
          Whatever you're going through — we've got you.
        </Text>

        {/* Scenario cards */}
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: 10 }]}>
          What's your situation?
        </Text>

        <ScenarioCard
          icon="⚠️"
          iconBg="rgba(255,115,46,0.12)"
          title="I think I'm being scammed right now."
          onPress={() => router.push('/safety/coming-soon')}
        />
        <View style={{ height: spacing.cardGap }} />

        <ScenarioCard
          icon="✓"
          iconBg={colors.successBg}
          title="I was scammed — what do I do?"
          onPress={() => router.push('/safety/guide/post')}
        />
        <View style={{ height: spacing.cardGap }} />

        <ScenarioCard
          icon="👥"
          iconBg="rgba(91,92,246,0.12)"
          title="Someone I know needs help."
          onPress={() => router.push('/safety/coming-soon')}
        />

        {/* AI Detector card */}
        <Text style={[type.label, { color: colors.textTertiary, marginTop: 28, marginBottom: 10 }]}>
          AI fraud detector
        </Text>

        <Pressable
          onPress={() => router.push('/safety/detector')}
          style={({ pressed }) => [
            styles.detectorCard,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.borderWeak,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.detectorTopRow}>
            <View style={styles.onlineRow}>
              <PulseDot color={brand.purpleCTA} size={7} />
              <Text style={[type.label, { color: colors.textTertiary, marginLeft: 6 }]}>online</Text>
            </View>
            <ArrowIcon size={16} color={colors.textSecondary} />
          </View>

          <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 4, fontSize: 14 }]}>
            EEZ Fraud Detector
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, lineHeight: 18 }]}>
            Paste a message, email, or describe a situation — we'll tell you if something's off.
          </Text>
          <Text style={[type.label, { color: brand.purpleCTA, marginTop: 12 }]}>try it now →</Text>
        </Pressable>

        {/* Emergency helplines */}
        <Text style={[type.label, { color: colors.textTertiary, marginTop: 28, marginBottom: 10 }]}>
          Emergency helplines
        </Text>

        <View style={[styles.helplinesCard, { backgroundColor: '#FFFFFF' }]}>
          {['FTC Report Fraud', 'FBI IC3', 'Crisis Text Line'].map((name, i) => (
            <View
              key={name}
              style={[
                styles.helplineRow,
                i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderWeak, marginTop: 10, paddingTop: 10 },
              ]}
            >
              <Text style={[type.body, { color: colors.textPrimary, flex: 1 }]}>{name}</Text>
              <View style={[styles.helplineDot, { backgroundColor: colors.bgTertiary }]} />
            </View>
          ))}

          <Pressable
            onPress={() => router.push('/safety/helplines')}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: 14 })}
          >
            <Text style={[type.label, { color: brand.purpleCTA }]}>see all helplines →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    gap: 12,
  },
  scenarioIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectorCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 16,
  },
  detectorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helplinesCard: {
    borderRadius: 14,
    padding: 14,
  },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helplineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
