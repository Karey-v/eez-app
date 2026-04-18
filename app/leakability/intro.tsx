// S12 — Test Intro
import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTestStore } from '@/store/testStore'

const CHIPS = ['⏱ ~5 mins', '🔒 totally private', '✨ personalized']

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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
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
        <Text style={styles.title}>the leakability test.</Text>

        {/* Description */}
        <Text style={styles.description}>
          10 real scenarios. use it as though it's your own phone screen. tap what you'd actually do. no right answers. no judgment. just vibes.
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
              leakability = how exposed your digital life is 🎯 passwords, social engineering, phishing — the works. this test shows you where you stand.
            </Text>
          </View>
        )}
      </ScrollView>
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
    color: '#0A0A0A',
    lineHeight: 40,
    marginBottom: 14,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 22,
    marginBottom: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#EEF0FF',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#5B5CF6',
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
    backgroundColor: '#5B5CF6',
    borderRadius: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    borderRadius: 50,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#5B5CF6',
  },
  secondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#5B5CF6',
  },
  explainCard: {
    marginTop: 14,
    backgroundColor: '#EEF0FF',
    borderRadius: 14,
    padding: 16,
  },
  explainText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#0A0A0A',
    lineHeight: 22,
  },
})
