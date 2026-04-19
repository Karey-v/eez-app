// Safety — full-screen entry point (SOS button)
// Same as safety tab but no Fraud Detector card, with BottomNav
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
import { BottomNav } from '@/components/ui/BottomNav'

// ─── Scenario card ────────────────────────────────────────────────────────────

function ScenarioCard({
  icon,
  iconBg,
  title,
  onPress,
}: {
  icon: string
  iconBg: string
  title: string
  onPress: () => void
}) {
  const { colors, type } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.scenarioCard,
        {
          backgroundColor: '#FFFFFF',
          borderColor: colors.borderWeak,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.scenarioIcon, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[type.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      <ArrowIcon size={16} color={colors.textSecondary} />
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SafetyModalScreen() {
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
          paddingBottom: 24,
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

      <BottomNav activeTab="home" />
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
