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
  const [showExplain, setShowExplain] = useState(false)

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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Detective emoji */}
        <Text style={styles.detectiveEmoji}>🕵️</Text>

        {/* Title */}
        <Text style={styles.title}>The leakability test.</Text>

        {/* Description */}
        <Text style={styles.description}>
          10 real scenarios. Use it as though it's your own phone screen. Tap what you'd actually do. No right answers. No judgment. Just vibes.
        </Text>

        {/* Info chips */}
        <View style={styles.chips}>
          {CHIPS.map((label) => (
            <View key={label} style={styles.chip}>
              <Text style={styles.chipText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Melting emoji — centered with space */}
        <View style={styles.emojiWrap}>
          <Text style={styles.meltEmoji}>🫠</Text>
        </View>

        {/* Primary CTA */}
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.primaryBtnText}>start the test 🚀</Text>
        </Pressable>

        {/* Secondary — toggles explanation */}
        <Pressable
          onPress={() => setShowExplain((v) => !v)}
          style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.secondaryBtnText}>wtf is leakability? 🤔</Text>
        </Pressable>

        {/* Explanation card */}
        {showExplain && (
          <View style={styles.explainCard}>
            <Text style={styles.explainText}>
              Leakability = how exposed your digital life is 🎯 Passwords, social engineering, phishing — the works. This test shows you where you stand.
            </Text>
          </View>
        )}
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
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: 14,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    paddingVertical: 48,
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
    borderRadius: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  secondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  explainCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
  },
  explainText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
})
