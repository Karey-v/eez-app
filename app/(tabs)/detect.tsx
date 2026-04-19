// Detect tab — EEZ Fraud Detector (tab context: no back button)
import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'

function PulseDot() {
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
  return <Animated.View style={[styles.pulseDot, style]} />
}

const QUICK_STARTS = [
  { icon: '📧', label: 'check an email', prefill: 'I got an email asking me to' },
  { icon: '💼', label: 'check a job offer', prefill: 'I got a job offer from' },
  { icon: '💬', label: 'suspicious message', prefill: 'I got a suspicious message saying' },
]

export default function DetectScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [input, setInput] = useState('')
  const inputRef = useRef<TextInput>(null)

  function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg) return
    router.push(`/safety/chat?message=${encodeURIComponent(msg)}`)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            paddingHorizontal: spacing.screenH,
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.borderWeak,
          },
        ]}
      >
        <View style={styles.headerTitle}>
          <Text style={styles.detectorTitle}>
            EEZ Fraud Detector
          </Text>
          <PulseDot />
        </View>
      </View>

      <View style={[styles.disclaimer, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.borderWeak }]}>
        <Text style={[type.bodySmall, { color: colors.textTertiary, textAlign: 'center', lineHeight: 15 }]}>
          EEZ Fraud Detector is an AI assistant. Results are indicative only — always verify independently.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 20,
          paddingHorizontal: spacing.screenH,
        }}
      >
        <View style={styles.botRow}>
          <View style={styles.avatar}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              resizeMode="cover"
            />
          </View>
          <View style={[styles.botBubble, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>
              Hey. paste a message, email subject, or describe a situation — i'll tell you if something's off.
            </Text>
          </View>
        </View>

        <Text style={[type.label, { color: colors.textTertiary, marginTop: 24, marginBottom: 10 }]}>
          quick start
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {QUICK_STARTS.map((qs) => (
            <Pressable
              key={qs.label}
              onPress={() => {
                setInput(qs.prefill)
                inputRef.current?.focus()
              }}
              style={({ pressed }) => [
                styles.quickCard,
                { backgroundColor: colors.bgSecondary, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={{ fontSize: 20, marginBottom: 8 }}>{qs.icon}</Text>
              <Text style={[type.body, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold', lineHeight: 16 }]}>
                {qs.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: 12,
            paddingHorizontal: spacing.screenH,
            backgroundColor: colors.bgPrimary,
            borderTopColor: colors.borderWeak,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          placeholder="describe the situation or paste a message…"
          placeholderTextColor={colors.textTertiary}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => handleSend()}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.borderWeak,
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
            },
          ]}
        />
        <Pressable
          onPress={() => handleSend()}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: input.trim() ? brand.purpleCTA : colors.bgTertiary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 20 }}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detectorTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#5B5CF6',
    marginRight: 8,
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#B1FF58',
  },
  disclaimer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botBubble: {
    borderRadius: 12,
    borderTopLeftRadius: 0,
    padding: 12,
    flex: 1,
  },
  quickCard: {
    width: 120,
    borderRadius: 14,
    padding: 14,
  },
  inputBar: {
    paddingTop: 12,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
