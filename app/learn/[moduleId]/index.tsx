// S33 — Module Intro
// Tag + duration chips, title, what you'll learn (✓ list), difficulty, Start CTA
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useLearnStore } from '@/store/learnStore'
import { modules } from '@/data/modules'
import { Button } from '@/components/ui/Button'
import { ArrowIcon } from '@/components/icons/Arrow'

export default function ModuleIntroScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>()
  const startModule = useLearnStore((s) => s.startModule)

  const module = modules.find((m) => m.id === moduleId)

  if (!module) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[type.body, { color: colors.textSecondary }]}>Module not found.</Text>
      </View>
    )
  }

  function handleStart() {
    startModule(moduleId)
    router.push(`/learn/${moduleId}/lesson`)
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>

        {/* Tag + duration chips */}
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.label, { color: colors.textPrimary }]}>{module.tag}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.label, { color: colors.textPrimary }]}>⏱ {module.duration}</Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[
            type.heroTitle,
            { color: colors.textPrimary, marginBottom: 6, marginTop: 18, lineHeight: 34 },
          ]}
        >
          {module.title.toLowerCase()}.
        </Text>
        <Text style={[type.bodySmall, { color: colors.textTertiary, marginBottom: 28 }]}>
          {module.difficulty} · {module.xp} XP on completion
        </Text>

        {/* What you'll learn */}
        <View style={[styles.learnCard, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 14 }]}>
            what you'll learn
          </Text>
          {module.whatYoullLearn.map((item) => (
            <View key={item} style={styles.learnRow}>
              <View style={[styles.checkCircle, { backgroundColor: brand.purpleCTA }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 9, fontFamily: 'Inter_700Bold' }}>✓</Text>
              </View>
              <Text style={[type.body, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={[
            type.bodySmall,
            { color: colors.textTertiary, textAlign: 'center', marginTop: 24, marginBottom: 32, lineHeight: 16 },
          ]}
        >
          {module.lessons.length} lessons · stays on your device · totally private
        </Text>

        <Button label="Start module" onPress={handleStart} variant="purple" fullWidth />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  learnCard: {
    borderRadius: 14,
    padding: 16,
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
})
