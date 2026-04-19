// S13–S22 — Leakability Test Questions (dynamic, type-driven)
// Handles: simulation-tap, slider, multiple-choice, scenario
import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { questions, getBand, scaleScore, Question } from '@/data/questions'
import { useTestStore } from '@/store/testStore'
import { useUserStore } from '@/store/userStore'
import { BottomNav } from '@/components/ui/BottomNav'

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ─── Score calculation ────────────────────────────────────────────────────────

function computeResults(answers: { questionId: number; score: number; category: string }[]) {
  const rawScore = answers.reduce((sum, a) => sum + a.score, 0)
  const scaledScore = scaleScore(rawScore)
  const band = getBand(scaledScore)

  const catMap: Record<string, number> = {
    Impulse: 0, Habits: 0, 'Social Pressure': 0, Verification: 0, 'Response Style': 0,
  }
  answers.forEach((a) => { catMap[a.category] = (catMap[a.category] ?? 0) + a.score })

  return {
    scaledScore,
    band,
    categoryScores: {
      impulse: catMap['Impulse'],
      habits: catMap['Habits'],
      socialPressure: catMap['Social Pressure'],
      verification: catMap['Verification'],
      responseStyle: catMap['Response Style'],
    },
  }
}

// ─── Progress lines ───────────────────────────────────────────────────────────

function ProgressLines({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.progressLines}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressLine,
            { backgroundColor: i <= current ? '#5B5CF6' : '#EEF0FF' },
          ]}
        />
      ))}
    </View>
  )
}

// ─── Root screen ─────────────────────────────────────────────────────────────

export default function QuestionScreen() {
  const { spacing } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { currentQuestionIndex, answers, answerQuestion, nextQuestion, completeTest } = useTestStore()
  const setScore = useUserStore((s) => s.setScore)

  const question = questions[currentQuestionIndex]

  // Restore previously given answer when user navigates back
  const storedAnswer = answers.find((a) => a.questionId === question.id)
  const initialSelectedIndex: number | null = (() => {
    if (!storedAnswer || !question.options) return null
    const idx = question.options.findIndex((o) => o.score === storedAnswer.score)
    return idx >= 0 ? idx : null
  })()

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      const option = question.options![optionIndex]
      answerQuestion(question.id, option.score, question.category)
    },
    [question, answerQuestion],
  )

  const handleAdvance = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion()
    } else {
      completeTest()
      const { answers: finalAnswers } = useTestStore.getState()
      const { scaledScore, band, categoryScores } = computeResults(finalAnswers)
      setScore(scaledScore, band.label, band.color, categoryScores)
      router.replace('/leakability/result')
    }
  }, [currentQuestionIndex, nextQuestion, completeTest, setScore, router])

  const handleBack = useCallback(() => {
    if (currentQuestionIndex === 0) {
      router.back()
      return
    }
    useTestStore.setState((s) => ({
      currentQuestionIndex: s.currentQuestionIndex - 1,
      answers: s.answers.filter((a) => a.questionId !== question.id),
    }))
  }, [currentQuestionIndex, question.id, router])

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />

      {/* Fixed header */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: spacing.screenH }}>
        <ProgressLines total={questions.length} current={currentQuestionIndex} />
        <View style={[styles.categoryPill, { marginTop: 28 }]}>
          <Text style={styles.categoryPillText}>{question.category}</Text>
        </View>
      </View>

      {/* Question body — keyed so state fully resets each question */}
      <QuestionBody
        key={currentQuestionIndex}
        question={question}
        onAnswer={handleAnswer}
        onAdvance={handleAdvance}
        onBack={handleBack}
        initialSelectedIndex={initialSelectedIndex}
      />
      <BottomNav activeTab="home" />
    </View>
  )
}

// ─── QuestionBody ─────────────────────────────────────────────────────────────

function QuestionBody({
  question,
  onAnswer,
  onAdvance,
  onBack,
  initialSelectedIndex,
}: {
  question: Question
  onAnswer: (optionIndex: number) => void
  onAdvance: () => void
  onBack: () => void
  initialSelectedIndex: number | null
}) {
  const { colors, type, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  // selectedIndex: set only when user makes a new tap (locks further taps)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  // displayIndex: visual highlight — starts from restored answer, updated on new tap
  const [displayIndex, setDisplayIndex] = useState<number | null>(initialSelectedIndex)
  const [sliderIndex, setSliderIndex] = useState<number | null>(initialSelectedIndex)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current) }
  }, [])

  function handleOptionSelect(optionIndex: number) {
    if (selectedIndex !== null) return
    setSelectedIndex(optionIndex)
    setDisplayIndex(optionIndex)
    onAnswer(optionIndex)
    advanceTimerRef.current = setTimeout(onAdvance, 600)
  }

  function handleSliderChange(index: number) {
    setSliderIndex(index)
    setDisplayIndex(index)
    onAnswer(index)
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    advanceTimerRef.current = setTimeout(onAdvance, 600)
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.body,
          {
            paddingHorizontal: spacing.screenH,
            paddingBottom: 24,
            paddingTop: 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Simulation card */}
        {question.type === 'simulation-tap' && question.simulation && (
          <View style={{ marginBottom: 28 }}>
            <Text style={[styles.questionText, { marginBottom: 24 }]}>
              {cap(question.prompt ?? '')}
            </Text>
            <SimulationCard
              simulation={question.simulation}
              asModal={question.id === 7}
            />
          </View>
        )}

        {/* Scenario — text directly on white */}
        {question.type === 'scenario' && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.questionText}>
              {cap(question.prompt ?? '')}
            </Text>
          </View>
        )}

        {/* Multiple-choice prompt */}
        {question.type === 'multiple-choice' && (
          <Text style={[styles.questionText, { marginBottom: 40 }]}>
            {cap(question.prompt ?? '')}
          </Text>
        )}

        {/* Slider */}
        {question.type === 'slider' && (
          <>
            <Text style={[styles.questionText, { marginBottom: 32 }]}>
              {cap(question.prompt ?? '')}
            </Text>
            <SliderQuestion
              options={question.options!}
              labels={question.sliderLabels!}
              selectedIndex={sliderIndex}
              onChange={handleSliderChange}
            />
          </>
        )}

        {/* Options */}
        {question.type !== 'slider' && question.options && (
          <View style={styles.options}>
            {question.type === 'scenario' && (
              <Text style={[type.label, { color: colors.textTertiary, marginBottom: 12 }]}>
                What do you do?
              </Text>
            )}
            {question.options.map((option, i) => (
              <OptionButton
                key={i}
                label={option.label}
                selected={displayIndex === i}
                anySelected={selectedIndex !== null}
                onPress={() => handleOptionSelect(i)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Back nav */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
        >
          <Text style={styles.navBackText}>← back</Text>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Simulation Card ──────────────────────────────────────────────────────────

function SimulationCard({
  simulation,
  asModal = false,
}: {
  simulation: NonNullable<Question['simulation']>
  asModal?: boolean
}) {
  const { uiType, sender, content, preview } = simulation

  const initials = sender
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // ── iOS-style lockscreen notification ────────────────────────────────────────
  if (uiType === 'notification') {
    const notifCard = (
      <View style={styles.iosNotifBanner}>
        <View style={styles.iosNotifTopRow}>
          <View style={[styles.iosNotifAppIcon, { backgroundColor: '#5B5CF6' }]}>
            <Text style={styles.iosNotifIconText}>{initials || '?'}</Text>
          </View>
          <Text style={styles.iosNotifAppName}>{sender}</Text>
          <Text style={styles.iosNotifTime}>now</Text>
        </View>
        {preview && (
          <Text style={styles.iosNotifTitle} numberOfLines={1}>{preview}</Text>
        )}
        <Text style={styles.iosNotifBody} numberOfLines={3}>{content}</Text>
      </View>
    )

    if (asModal) {
      return (
        <View style={styles.modalDim}>
          <View style={styles.modalPhoneHint}>
            <Text style={styles.modalTime}>9:41</Text>
            <Text style={styles.modalDate}>Wednesday, April 18</Text>
          </View>
          {notifCard}
        </View>
      )
    }

    return (
      <View style={styles.iosLockscreen}>
        <Text style={styles.lockTime}>9:41</Text>
        <Text style={styles.lockDate}>Wednesday, April 18</Text>
        {notifCard}
      </View>
    )
  }

  // ── iMessage-style ────────────────────────────────────────────────────────────
  if (uiType === 'message') {
    return (
      <View style={styles.iMessageContainer}>
        <View style={styles.iMessageHeader}>
          <View style={[styles.iMessageAvatar, { backgroundColor: '#34C759' }]}>
            <Text style={styles.iMessageAvatarText}>{initials || '?'}</Text>
          </View>
          <View>
            <Text style={styles.iMessageSenderName}>{sender}</Text>
            <Text style={styles.iMessageMeta}>iMessage</Text>
          </View>
        </View>
        <View style={styles.iMessageChatArea}>
          <View style={styles.iMessageBubbleRow}>
            <View style={[styles.iMessageAvatarSmall, { backgroundColor: '#34C759' }]}>
              <Text style={styles.iMessageAvatarSmallText}>{initials || '?'}</Text>
            </View>
            <View style={styles.iMessageBubble}>
              <Text style={styles.iMessageBubbleText}>{content}</Text>
            </View>
          </View>
          <Text style={styles.iMessageDelivered}>delivered</Text>
        </View>
      </View>
    )
  }

  // ── Email inbox card ──────────────────────────────────────────────────────────
  if (uiType === 'email') {
    return (
      <View style={styles.emailInboxCard}>
        <View style={styles.emailInboxRow}>
          <View style={[styles.emailAvatar, { backgroundColor: '#FF3B30' }]}>
            <Text style={styles.emailAvatarText}>{initials || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.emailInboxTopLine}>
              <Text style={styles.emailInboxSender} numberOfLines={1}>{sender}</Text>
              <Text style={styles.emailInboxTime}>now</Text>
            </View>
            {preview && (
              <Text style={styles.emailInboxSubject} numberOfLines={1}>{preview}</Text>
            )}
            <Text style={styles.emailInboxPreview} numberOfLines={2}>{content}</Text>
          </View>
        </View>
      </View>
    )
  }

  // ── Alert fallback ────────────────────────────────────────────────────────────
  const { colors, type } = useTheme()
  return (
    <View style={[styles.simCardAlert, { backgroundColor: colors.dangerBg, borderColor: colors.dangerText }]}>
      <Text style={[type.cardTitle, { color: colors.dangerText }]}>{sender}</Text>
      <Text style={[type.body, { color: colors.textPrimary, marginTop: 6, lineHeight: 18 }]}>{content}</Text>
    </View>
  )
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  anySelected,
  onPress,
}: {
  label: string
  selected: boolean
  anySelected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={anySelected}
      style={[
        styles.optionBtn,
        {
          borderColor: selected ? 'rgba(98,44,255,0.6)' : 'rgba(98,44,255,0.2)',
          borderWidth: 1,
          backgroundColor: selected ? '#EEF0FF' : '#FFFFFF',
          opacity: anySelected && !selected ? 0.45 : 1,
        },
      ]}
    >
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
  )
}

// ─── Slider Question ──────────────────────────────────────────────────────────

function SliderQuestion({
  options,
  labels,
  selectedIndex,
  onChange,
}: {
  options: NonNullable<Question['options']>
  labels: { left: string; right: string }
  selectedIndex: number | null
  onChange: (index: number) => void
}) {
  const { colors, brand, type } = useTheme()
  const containerWidthRef = useRef(0)
  const STEPS = options.length

  function indexFromX(x: number) {
    if (containerWidthRef.current === 0) return 0
    const raw = (x / containerWidthRef.current) * (STEPS - 1)
    return Math.max(0, Math.min(STEPS - 1, Math.round(raw)))
  }

  const fillPercent = selectedIndex !== null ? (selectedIndex / (STEPS - 1)) * 100 : 0

  return (
    <View>
      <View
        onLayout={(e) => { containerWidthRef.current = e.nativeEvent.layout.width }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => onChange(indexFromX(e.nativeEvent.locationX))}
        onResponderMove={(e) => onChange(indexFromX(e.nativeEvent.locationX))}
        style={styles.sliderTouchArea}
      >
        <View style={[styles.sliderTrack, { backgroundColor: colors.bgTertiary }]}>
          {selectedIndex !== null && (
            <View style={[styles.sliderFill, { width: `${fillPercent}%`, backgroundColor: brand.purpleCTA }]} />
          )}
        </View>
        {options.map((_, i) => {
          const pct = i / (STEPS - 1)
          const isActive = selectedIndex !== null && i <= selectedIndex
          return (
            <View
              key={i}
              style={[
                styles.sliderTick,
                {
                  left: `${pct * 100}%` as any,
                  backgroundColor: isActive ? brand.purpleCTA : colors.bgTertiary,
                  borderColor: isActive ? brand.purpleCTA : colors.borderWeak,
                },
              ]}
            />
          )
        })}
        {selectedIndex !== null && (
          <Animated.View
            style={[styles.sliderThumb, { left: `${fillPercent}%` as any, backgroundColor: brand.purpleCTA }]}
          />
        )}
      </View>

      <View style={styles.sliderLabelRow}>
        <Text style={[type.bodySmall, { color: colors.textTertiary, flex: 1 }]}>{labels.left}</Text>
        <Text style={[type.bodySmall, { color: colors.textTertiary }]}>{labels.right}</Text>
      </View>

      <View style={styles.sliderStepRow}>
        {options.map((opt, i) => (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            style={{ flex: 1, alignItems: i === 0 ? 'flex-start' : i === STEPS - 1 ? 'flex-end' : 'center' }}
          >
            <Text
              style={[
                type.label,
                {
                  color: selectedIndex === i ? brand.purpleCTA : colors.textTertiary,
                  fontFamily: selectedIndex === i ? 'Inter_700Bold' : 'Inter_600SemiBold',
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  progressLines: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  progressLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#B1FF58',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1A4A00',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  body: {
    flexGrow: 1,
  },
  questionText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '400',
    color: '#5B5CF6',
    textAlign: 'left',
  },
  options: {
    gap: 12,
  },
  optionBtn: {
    borderRadius: 50,
    minHeight: 56,
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  optionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#0A0A0A',
    lineHeight: 20,
  },

  // ── Back / Next nav bar ──
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FFFFFF',
  },
  navBackText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  navNextText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#5B5CF6',
    textDecorationLine: 'underline',
  },

  // ── iOS lockscreen notification ──
  iosLockscreen: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
  },
  lockTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 54,
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 58,
  },
  lockDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 20,
    marginTop: 2,
  },
  iosNotifBanner: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    padding: 13,
    width: '100%',
  },
  iosNotifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 7,
  },
  iosNotifAppIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosNotifIconText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  iosNotifAppName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
  },
  iosNotifTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  iosNotifTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  iosNotifBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },

  // ── Gift card modal ──
  modalDim: {
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  modalPhoneHint: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 54,
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 58,
  },
  modalDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // ── iMessage ──
  iMessageContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    overflow: 'hidden',
  },
  iMessageHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iMessageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iMessageAvatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  iMessageSenderName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
  },
  iMessageMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  iMessageChatArea: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
  },
  iMessageBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  iMessageAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iMessageAvatarSmallText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  iMessageBubble: {
    backgroundColor: '#E5E5EA',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  iMessageBubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#0A0A0A',
    lineHeight: 19,
  },
  iMessageDelivered: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Email inbox card ──
  emailInboxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  emailInboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emailAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emailAvatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emailInboxTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  emailInboxSender: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#0A0A0A',
    flex: 1,
    marginRight: 8,
  },
  emailInboxTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    flexShrink: 0,
  },
  emailInboxSubject: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0A0A0A',
    marginBottom: 2,
  },
  emailInboxPreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 17,
  },

  // ── Alert fallback ──
  simCardAlert: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },

  // ── Slider ──
  sliderTouchArea: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    borderRadius: 2,
  },
  sliderTick: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    top: (44 - 10) / 2,
    transform: [{ translateX: -5 }],
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    top: (44 - 22) / 2,
    transform: [{ translateX: -11 }],
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderStepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
})
