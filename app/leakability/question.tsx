// S13–S22 — Leakability Test Questions (dynamic, type-driven)
// Handles: simulation-tap, slider, multiple-choice, scenario
// Progress lines fill as questions advance. Auto-advances after selection (except slider).
import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { Button } from '@/components/ui/Button'
import { questions, getBand, scaleScore, Question } from '@/data/questions'
import { useTestStore } from '@/store/testStore'
import { useUserStore } from '@/store/userStore'

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
            { backgroundColor: i <= current ? '#0A0A0A' : 'rgba(0,0,0,0.15)' },
          ]}
        />
      ))}
    </View>
  )
}

// ─── Root screen ─────────────────────────────────────────────────────────────

export default function QuestionScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { currentQuestionIndex, answers, answerQuestion, nextQuestion, completeTest } = useTestStore()
  const setScore = useUserStore((s) => s.setScore)

  const question = questions[currentQuestionIndex]

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSecondary }}>
      <StatusBar style="dark" />

      {/* ── Fixed header ── */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: spacing.screenH }}>
        {/* Thin progress lines — very top */}
        <ProgressLines total={questions.length} current={currentQuestionIndex} />

        {/* Category label — lots of space above */}
        <Text
          style={[
            type.label,
            { color: colors.textTertiary, marginTop: 28 },
          ]}
        >
          {question.category}
        </Text>
      </View>

      {/* ── Question body — keyed so state fully resets each question ── */}
      <QuestionBody
        key={currentQuestionIndex}
        question={question}
        onAnswer={handleAnswer}
        onAdvance={handleAdvance}
      />
    </View>
  )
}

// ─── QuestionBody — resets per question via key prop ─────────────────────────

function QuestionBody({
  question,
  onAnswer,
  onAdvance,
}: {
  question: Question
  onAnswer: (optionIndex: number) => void
  onAdvance: () => void
}) {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [sliderIndex, setSliderIndex] = useState<number | null>(null)
  const [advancing, setAdvancing] = useState(false)

  function handleOptionSelect(optionIndex: number) {
    if (selectedIndex !== null || advancing) return
    setSelectedIndex(optionIndex)
    onAnswer(optionIndex)

    if (question.type !== 'slider') {
      setAdvancing(true)
      setTimeout(() => onAdvance(), 900)
    }
  }

  function handleSliderChange(index: number) {
    setSliderIndex(index)
    setSelectedIndex(index)
    onAnswer(index)
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.body,
        {
          paddingHorizontal: spacing.screenH,
          paddingBottom: insets.bottom + 24,
          paddingTop: 32,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Simulation card — shown for simulation-tap questions */}
      {question.type === 'simulation-tap' && question.simulation && (
        <View style={{ marginBottom: 28 }}>
          <Text style={[type.label, { color: colors.textTertiary, marginBottom: 10 }]}>
            {question.prompt}
          </Text>
          <SimulationCard simulation={question.simulation} />
        </View>
      )}

      {/* Scenario card — shown for scenario questions */}
      {question.type === 'scenario' && (
        <View
          style={[
            styles.scenarioCard,
            { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak },
          ]}
        >
          <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 6 }]}>scenario</Text>
          <Text style={[type.body, { color: colors.textPrimary, lineHeight: 20 }]}>
            {question.prompt}
          </Text>
        </View>
      )}

      {/* Question prompt — multiple-choice */}
      {question.type === 'multiple-choice' && (
        <Text
          style={[
            styles.questionText,
            { color: '#0A0A0A', marginBottom: 40 },
          ]}
        >
          {question.prompt}
        </Text>
      )}

      {/* Slider question */}
      {question.type === 'slider' && (
        <>
          <Text style={[styles.questionText, { color: '#0A0A0A', marginBottom: 32 }]}>
            {question.prompt}
          </Text>
          <SliderQuestion
            options={question.options!}
            labels={question.sliderLabels!}
            selectedIndex={sliderIndex}
            onChange={handleSliderChange}
          />
          {sliderIndex !== null && (
            <View style={{ marginTop: 24 }}>
              <Button label="next →" onPress={onAdvance} variant="purple" fullWidth />
            </View>
          )}
        </>
      )}

      {/* Options — for simulation-tap, multiple-choice, scenario */}
      {question.type !== 'slider' && question.options && (
        <View style={styles.options}>
          {question.type === 'scenario' && (
            <Text style={[type.label, { color: colors.textTertiary, marginBottom: 12 }]}>
              what do you do?
            </Text>
          )}
          {question.options.map((option, i) => (
            <OptionButton
              key={i}
              label={option.label}
              feedback={option.feedback}
              score={option.score}
              selected={selectedIndex === i}
              anySelected={selectedIndex !== null}
              showFeedback={selectedIndex === i}
              onPress={() => handleOptionSelect(i)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

// ─── Simulation Card ─────────────────────────────────────────────────────────

function SimulationCard({
  simulation,
}: {
  simulation: NonNullable<Question['simulation']>
}) {
  const { colors, type } = useTheme()
  const { uiType, sender, content, preview } = simulation

  const initials = sender
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (uiType === 'notification') {
    return (
      <View style={[styles.simCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak }]}>
        <View style={styles.notifRow}>
          <View style={[styles.notifIcon, { backgroundColor: '#5B5CF6' }]}>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' }}>
              {initials || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[type.cardTitle, { color: colors.textPrimary }]}>{sender}</Text>
              <Text style={[type.meta, { color: colors.textTertiary }]}>now</Text>
            </View>
            {preview && (
              <Text style={[type.bodySmall, { color: colors.textSecondary, fontFamily: 'Inter_700Bold', fontWeight: '700', marginTop: 1 }]}>
                {preview}
              </Text>
            )}
          </View>
        </View>
        <Text style={[type.body, { color: colors.textPrimary, marginTop: 10, lineHeight: 18 }]}>
          {content}
        </Text>
      </View>
    )
  }

  if (uiType === 'message') {
    return (
      <View style={[styles.simCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak }]}>
        <View style={styles.messageHeader}>
          <View style={[styles.avatar, { backgroundColor: '#007549' }]}>
            <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold' }}>
              {initials || '?'}
            </Text>
          </View>
          <Text style={[type.cardTitle, { color: colors.textPrimary }]}>{sender}</Text>
        </View>
        <View style={styles.messageBubble}>
          <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>{content}</Text>
        </View>
      </View>
    )
  }

  if (uiType === 'email') {
    return (
      <View style={[styles.simCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak }]}>
        <View style={styles.emailHeader}>
          <Text style={[type.meta, { color: colors.textTertiary, width: 40 }]}>FROM</Text>
          <Text style={[type.body, { color: colors.textPrimary, flex: 1, fontFamily: 'Inter_700Bold', fontWeight: '700' }]} numberOfLines={1}>
            {sender}
          </Text>
        </View>
        {preview && (
          <View style={[styles.emailRow, { borderTopWidth: 0.5, borderTopColor: colors.borderWeak }]}>
            <Text style={[type.meta, { color: colors.textTertiary, width: 40 }]}>RE</Text>
            <Text style={[type.body, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {preview}
            </Text>
          </View>
        )}
        <View style={[{ borderTopWidth: 0.5, borderTopColor: colors.borderWeak, paddingTop: 10, marginTop: 4 }]}>
          <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>{content}</Text>
        </View>
      </View>
    )
  }

  // alert fallback
  return (
    <View style={[styles.simCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerText }]}>
      <Text style={[type.cardTitle, { color: colors.dangerText }]}>{sender}</Text>
      <Text style={[type.body, { color: colors.textPrimary, marginTop: 6, lineHeight: 18 }]}>{content}</Text>
    </View>
  )
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  feedback,
  score,
  selected,
  anySelected,
  showFeedback,
  onPress,
}: {
  label: string
  feedback?: string
  score: number
  selected: boolean
  anySelected: boolean
  showFeedback: boolean
  onPress: () => void
}) {
  const { colors, type } = useTheme()

  const feedbackColor =
    score === 0 ? colors.successText : score === 1 ? colors.warningText : colors.dangerText

  return (
    <Pressable
      onPress={onPress}
      disabled={anySelected}
      style={({ pressed }) => [
        styles.optionBtn,
        {
          borderColor: selected ? '#5B5CF6' : 'rgba(0,0,0,0.2)',
          borderWidth: selected ? 1.5 : 1,
          backgroundColor: selected ? '#F0EEFF' : 'transparent',
          opacity: anySelected && !selected ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: colors.textPrimary,
          lineHeight: 20,
        }}
      >
        {label}
      </Text>
      {showFeedback && feedback && (
        <Animated.View entering={FadeIn.duration(200)}>
          <Text style={[type.bodySmall, { color: feedbackColor, marginTop: 6, lineHeight: 16 }]}>
            {feedback}
          </Text>
        </Animated.View>
      )}
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
      {/* Track + thumb */}
      <View
        onLayout={(e) => { containerWidthRef.current = e.nativeEvent.layout.width }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => onChange(indexFromX(e.nativeEvent.locationX))}
        onResponderMove={(e) => onChange(indexFromX(e.nativeEvent.locationX))}
        style={styles.sliderTouchArea}
      >
        {/* Track background */}
        <View style={[styles.sliderTrack, { backgroundColor: colors.bgTertiary }]}>
          {/* Fill */}
          {selectedIndex !== null && (
            <View
              style={[
                styles.sliderFill,
                { width: `${fillPercent}%`, backgroundColor: brand.purpleCTA },
              ]}
            />
          )}
        </View>

        {/* Step tick marks */}
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

        {/* Thumb */}
        {selectedIndex !== null && (
          <Animated.View
            style={[
              styles.sliderThumb,
              {
                left: `${fillPercent}%` as any,
                backgroundColor: brand.purpleCTA,
              },
            ]}
          />
        )}
      </View>

      {/* Left / right labels */}
      <View style={styles.sliderLabelRow}>
        <Text style={[type.bodySmall, { color: colors.textTertiary, flex: 1 }]}>{labels.left}</Text>
        <Text style={[type.bodySmall, { color: colors.textTertiary }]}>{labels.right}</Text>
      </View>

      {/* Step value labels */}
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

      {/* Selected value display */}
      {selectedIndex !== null && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.sliderValue, { backgroundColor: colors.bgPrimary }]}>
          <Text style={[type.label, { color: brand.purpleCTA }]}>
            {selectedIndex === 0
              ? 'great — unique passwords are the strongest foundation.'
              : selectedIndex === 1
              ? 'one shared password is one too many.'
              : selectedIndex === 2
              ? 'a few shared passwords leaves multiple accounts exposed.'
              : 'most accounts shared — high exposure if any one gets breached.'}
          </Text>
        </Animated.View>
      )}
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
  body: {
    flexGrow: 1,
  },
  questionText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400',
  },
  scenarioCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  optionBtn: {
    borderRadius: 50,
    minHeight: 64,
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  simCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  messageBubble: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
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
  sliderValue: {
    borderRadius: 10,
    padding: 12,
  },
})
