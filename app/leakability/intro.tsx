// S12 — Test Intro
import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTestStore } from '@/store/testStore'
import { BottomNav } from '@/components/ui/BottomNav'

const CHIPS = ['⏱ ~5 mins', '🔒 Totally private', '✨ Personalized']

export default function TestIntroScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const resetTest = useTestStore((s) => s.resetTest)
  const [showExplainer, setShowExplainer] = useState(false)

  function handleStart() {
    resetTest()
    router.push('/leakability/question')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#5B5CF6' }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: 100 },
        ]}
      >
        {/* Detective emoji */}
        <Text style={styles.detectiveEmoji}>🕵️</Text>

        {/* Title */}
        <Text style={styles.title}>The Leakability Score</Text>

        {/* Description */}
        <Text style={styles.description}>
          Real scenarios. Use it as though it is your own phone screen — tap what you'd actually do. No right answers. No judgment.
        </Text>

        {/* Info chips */}
        <View style={styles.chips}>
          {CHIPS.map((label) => (
            <View key={label} style={styles.chip}>
              <Text style={styles.chipText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Melting emoji */}
        <View style={styles.emojiWrap}>
          <Text style={styles.meltEmoji}>🫠</Text>
        </View>

        {/* Primary CTA */}
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.primaryBtnText}>start the test</Text>
        </Pressable>

        {/* Secondary: What is leakability? */}
        {showExplainer && (
          <Text style={styles.explainerText}>
            The leakability score reflects the probability of a user falling for financial fraud based on their habits and behavioral patterns.
          </Text>
        )}

        <Pressable
          onPress={() => setShowExplainer((v) => !v)}
          style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.secondaryBtnText}>What is leakability?</Text>
        </Pressable>
      </ScrollView>
      <BottomNav activeTab="home" />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  detectiveEmoji: {
    fontSize: 48,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 34,
    color: '#FFFFFF',
    lineHeight: 42,
    marginBottom: 14,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  emojiWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  meltEmoji: {
    fontSize: 80,
  },
  primaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#5B5CF6',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
  },
  explainerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
})
