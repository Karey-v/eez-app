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
import { BottomNav } from '@/components/ui/BottomNav'

export default function ModuleIntroScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>()
  const startModule = useLearnStore((s) => s.startModule)

  const module = modules.find((m) => m.id === moduleId)

  if (!module) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[type.body, { color: colors.textSecondary }]}>Module not found.</Text>
      </View>
    )
  }

  if (module.locked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#5B5CF6', paddingTop: insets.top + 16, paddingHorizontal: spacing.screenH }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color="#FFFFFF" direction="left" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 32, color: '#FFFFFF', textAlign: 'center' }}>
            coming soon.
          </Text>
          <Text style={[type.bodySmall, { color: 'rgba(255,255,255,0.6)', marginTop: 10, textAlign: 'center' }]}>
            This module is on its way.
          </Text>
        </View>
        <BottomNav activeTab="learn" />
      </View>
    )
  }

  function handleStart() {
    startModule(moduleId)
    router.push(`/learn/${moduleId}/lesson`)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#5B5CF6' }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color="#FFFFFF" direction="left" />
        </Pressable>

        {/* Tag + duration chips */}
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[type.label, { color: '#FFFFFF', textTransform: 'none' }]}>{module.tag}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[type.label, { color: '#FFFFFF', textTransform: 'none' }]}>⏱ {module.duration}</Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[
            type.heroTitle,
            { color: '#FFFFFF', marginBottom: 6, marginTop: 18, lineHeight: 34 },
          ]}
        >
          {module.title.charAt(0).toUpperCase() + module.title.slice(1).toLowerCase()}.
        </Text>
        <Text style={[type.bodySmall, { color: 'rgba(255,255,255,0.7)', marginBottom: 28 }]}>
          {module.difficulty} · {module.xp} XP on completion
        </Text>

        {/* What you'll learn */}
        <View style={[styles.learnCard, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[type.cardTitle, { color: colors.textPrimary, marginBottom: 14 }]}>
            What you'll learn
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
            { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 24, marginBottom: 32, lineHeight: 16 },
          ]}
        >
          {module.lessons.length} lessons · stays on your device · totally private
        </Text>

        <Button label="Start module" onPress={handleStart} variant="lime" fullWidth />
      </ScrollView>
      <BottomNav activeTab="learn" />
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
