// S48c — Detector Chat
// User bubbles right, bot bubbles left, typing indicator, FraudScoreCard
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
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
} from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { ArrowIcon } from '@/components/icons/Arrow'
import { FraudScoreCard } from '@/components/ui/FraudScoreCard'
import { BottomNav } from '@/components/ui/BottomNav'
import { getResponse, type MockResponse } from '@/data/chatResponses'

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  response?: MockResponse
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDot({ delay }: { delay: number }) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 }),
        ),
        -1,
        false,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View
      style={[styles.typingDot, { backgroundColor: colors.textTertiary }, style]}
    />
  )
}

function TypingIndicator() {
  const { colors, brand } = useTheme()
  return (
    <View style={styles.botRow}>
      <View style={[styles.avatar, { backgroundColor: brand.darkGreen }]}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11 }}>EEZ</Text>
      </View>
      <View style={[styles.botBubble, { backgroundColor: colors.bgSecondary }]}>
        <View style={styles.typingRow}>
          <TypingDot delay={0} />
          <TypingDot delay={200} />
          <TypingDot delay={400} />
        </View>
      </View>
    </View>
  )
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  const { colors, type, brand } = useTheme()
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.userRow}>
      <View style={[styles.userBubble, { backgroundColor: brand.purpleCTA }]}>
        <Text style={[type.body, { color: '#FFFFFF', lineHeight: 18 }]}>{text}</Text>
      </View>
    </Animated.View>
  )
}

function BotMessage({
  text,
  response,
  onGuidePress,
}: {
  text: string
  response?: MockResponse
  onGuidePress: () => void
}) {
  const { colors, type, brand } = useTheme()
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.botRow}>
      <View style={[styles.avatar, { backgroundColor: brand.darkGreen }]}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11 }}>EEZ</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={[styles.botBubble, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>{text}</Text>
        </View>
        {response && (
          <View style={{ marginTop: 8 }}>
            <FraudScoreCard
              likelihood={response.likelihood}
              level={response.level}
              redFlags={response.redFlags}
              looksOkay={response.looksOkay}
              whatToDoNext={response.whatToDoNext}
              onGuidePress={response.showGuideButton ? onGuidePress : undefined}
            />
          </View>
        )}
      </View>
    </Animated.View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { message: initialMessage } = useLocalSearchParams<{ message?: string }>()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
    return () => clearTimeout(t)
  }, [messages, isTyping])

  // Fire the initial message from detector home
  useEffect(() => {
    if (!initialMessage?.trim()) return
    const text = initialMessage.trim()
    const userMsg: Message = { id: 'u0', role: 'user', text }
    setMessages([userMsg])
    setIsTyping(true)
    timerRef.current = setTimeout(() => {
      const res = getResponse(text)
      setMessages([userMsg, { id: 'b0', role: 'bot', text: res.botMessage, response: res }])
      setIsTyping(false)
    }, 1800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function sendMessage() {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    timerRef.current = setTimeout(() => {
      const res = getResponse(text)
      setMessages((prev) => [
        ...prev,
        { id: `b${Date.now()}`, role: 'bot', text: res.botMessage, response: res },
      ])
      setIsTyping(false)
    }, 1800)
  }

  function handleGuidePress() {
    router.push('/safety/guide/post')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="dark" />

      {/* Header */}
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
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>
        <Text style={[type.cardTitle, { color: colors.textPrimary, fontSize: 14 }]}>
          EEZ Fraud Detector
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 16,
          paddingHorizontal: spacing.screenH,
          gap: 12,
        }}
      >
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <UserBubble key={msg.id} text={msg.text} />
          ) : (
            <BotMessage
              key={msg.id}
              text={msg.text}
              response={msg.response}
              onGuidePress={handleGuidePress}
            />
          ),
        )}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: spacing.screenH,
            backgroundColor: colors.bgPrimary,
            borderTopColor: colors.borderWeak,
          },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="follow up or paste something else…"
          placeholderTextColor={colors.textTertiary}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          editable={!isTyping}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.borderWeak,
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              opacity: isTyping ? 0.5 : 1,
            },
          ]}
        />
        <Pressable
          onPress={sendMessage}
          disabled={isTyping || !input.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor:
                isTyping || !input.trim() ? colors.bgTertiary : brand.purpleCTA,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 20 }}>↑</Text>
        </Pressable>
      </View>
      <BottomNav activeTab="home" />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
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
    marginTop: 2,
  },
  botBubble: {
    borderRadius: 12,
    borderTopLeftRadius: 0,
    padding: 12,
    flex: 1,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    borderRadius: 12,
    borderTopRightRadius: 0,
    padding: 12,
    maxWidth: '80%',
  },
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
