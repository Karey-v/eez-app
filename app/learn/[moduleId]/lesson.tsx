// S34–S38 — Lesson Screen (dynamic, type-driven)
// 5 lesson types: text-visual, swipe-reveal, tap-uncover, scenario, quick-check
// Progress dots top, type chip, fixed "Next →" CTA when ready
import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
} from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useLearnStore } from '@/store/learnStore'
import { modules, type Lesson, type Hotspot } from '@/data/modules'
import { ArrowIcon } from '@/components/icons/Arrow'
import { BottomNav } from '@/components/ui/BottomNav'

function sc(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

// ─── Type chip labels ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  'text-visual':  'read',
  'swipe-reveal': 'reveal',
  'tap-uncover':  'explore',
  'scenario':     'decide',
  'quick-check':  'quiz',
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i <= current ? '#5B5CF6' : '#EEF0FF' }]}
        />
      ))}
    </View>
  )
}

// ─── Text + Visual ────────────────────────────────────────────────────────────

function TextVisualLesson({ lesson }: { lesson: Lesson }) {
  const { colors, type, brand } = useTheme()
  return (
    <View>
      <Text style={[type.heroTitle, { color: '#5B5CF6', marginBottom: 20, lineHeight: 34 }]}>
        {sc(lesson.title)}
      </Text>
      {lesson.body && (
        <Text style={[type.body, { color: colors.textSecondary, lineHeight: 20, marginBottom: 20 }]}>
          {lesson.body}
        </Text>
      )}
      {lesson.insight && (
        <View style={[styles.insightCard, { backgroundColor: '#EEF0FF' }]}>
          <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 6, textTransform: 'none' }]}>EEZ insight</Text>
          <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>
            {lesson.insight}
          </Text>
        </View>
      )}
    </View>
  )
}

// ─── Swipe Reveal ────────────────────────────────────────────────────────────

function SwipeRevealLesson({
  lesson,
  onReady,
}: {
  lesson: Lesson
  onReady: () => void
}) {
  const { colors, type, brand } = useTheme()
  const [revealed, setRevealed] = useState(false)
  const overlayOpacity = useSharedValue(1)

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }))

  function reveal() {
    if (revealed) return
    setRevealed(true)
    overlayOpacity.value = withTiming(0, { duration: 350 })
    onReady()
  }

  return (
    <View>
      <Text style={[type.heroTitle, { color: '#5B5CF6', marginBottom: 20, lineHeight: 34 }]}>
        {sc(lesson.title)}
      </Text>

      {/* Reveal panel */}
      <Pressable
        onPress={reveal}
        style={[styles.revealCard, { backgroundColor: '#EEF0FF' }]}
      >
        {lesson.subtitle && (
          <Text style={[type.label, { color: '#5B5CF6', marginBottom: 14, textTransform: 'none' }]}>
            {lesson.subtitle}
          </Text>
        )}
        {/* Answer — always rendered, hidden by overlay */}
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 20,
            fontWeight: '700',
            color: '#0A0A0A',
            textAlign: 'center',
            lineHeight: 26,
          }}
        >
          {lesson.revealAnswer}
        </Text>

        {/* Overlay */}
        {!revealed && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.revealOverlay,
              overlayStyle,
              { backgroundColor: '#EEF0FF' },
            ]}
          >
            <Text style={{ fontSize: 28, marginBottom: 10 }}>👆</Text>
            <Text style={[type.label, { color: '#5B5CF6', textTransform: 'none' }]}>{lesson.revealLabel}</Text>
          </Animated.View>
        )}
      </Pressable>
      {!revealed && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: '#5B5CF6',
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          Swipe to reveal
        </Text>
      )}

      {revealed && lesson.body && (
        <Animated.Text
          entering={FadeIn.duration(300)}
          style={[type.body, { color: colors.textSecondary, lineHeight: 20, marginTop: 20 }]}
        >
          {lesson.body}
        </Animated.Text>
      )}
    </View>
  )
}

// ─── Pulsing Hotspot ─────────────────────────────────────────────────────────

function PulsingHotspot({
  spot,
  revealed,
  onTap,
}: {
  spot: Hotspot
  revealed: boolean
  onTap: () => void
}) {
  const { colors, brand } = useTheme()
  const scale = useSharedValue(1)

  useEffect(() => {
    if (!revealed) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 850 }),
          withTiming(1, { duration: 850 }),
        ),
        -1,
        false,
      )
    } else {
      scale.value = withTiming(1, { duration: 200 })
    }
  }, [revealed])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable onPress={onTap} hitSlop={8}>
      <Animated.View
        style={[
          styles.hotspotPill,
          {
            backgroundColor: revealed ? brand.purpleCTA : colors.bgSecondary,
            borderColor: revealed ? brand.purpleCTA : colors.borderMid,
          },
          animStyle,
        ]}
      >
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 13,
            color: revealed ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          {spot.label}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

// ─── Tap Uncover ─────────────────────────────────────────────────────────────

function TapUncoverLesson({
  lesson,
  onReady,
}: {
  lesson: Lesson
  onReady: () => void
}) {
  const { colors, type, brand } = useTheme()
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)

  const hotspots = lesson.hotspots ?? []
  const allRevealed = revealed.size >= hotspots.length

  useEffect(() => {
    if (allRevealed) onReady()
  }, [allRevealed])

  function tap(id: string) {
    setRevealed((prev) => new Set([...prev, id]))
    setActiveId(id)
  }

  const activeSpot = hotspots.find((h) => h.id === activeId)

  return (
    <View>
      <Text style={[type.heroTitle, { color: '#5B5CF6', marginBottom: 12, lineHeight: 34 }]}>
        {sc(lesson.title)}
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, lineHeight: 18, marginBottom: 24 }]}>
        {lesson.body}
      </Text>

      {/* Hotspot pills */}
      <View style={styles.hotspotRow}>
        {hotspots.map((spot) => (
          <PulsingHotspot
            key={spot.id}
            spot={spot}
            revealed={revealed.has(spot.id)}
            onTap={() => tap(spot.id)}
          />
        ))}
      </View>

      {/* Explanation */}
      {activeSpot && (
        <Animated.View
          key={activeSpot.id}
          entering={FadeIn.duration(200)}
          style={[styles.explanationCard, { backgroundColor: '#FFFFFF' }]}
        >
          <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 6, textTransform: 'none' }]}>
            {activeSpot.label}
          </Text>
          <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>
            {activeSpot.explanation}
          </Text>
        </Animated.View>
      )}

      {!allRevealed && (
        <Text
          style={[
            type.bodySmall,
            { color: colors.textTertiary, marginTop: 16, textAlign: 'center' },
          ]}
        >
          Tap all {hotspots.length} parts to continue
        </Text>
      )}
    </View>
  )
}

// ─── Scenario / Quick Check ───────────────────────────────────────────────────

function ChoiceLesson({
  lesson,
  onReady,
}: {
  lesson: Lesson
  onReady: () => void
}) {
  const { colors, type, brand } = useTheme()
  const [selected, setSelected] = useState<number | null>(null)
  const options = lesson.options ?? []

  function select(i: number) {
    if (selected !== null) return
    setSelected(i)
    onReady()
  }

  return (
    <View>
      <Text style={[type.heroTitle, { color: '#5B5CF6', marginBottom: 24, lineHeight: 34 }]}>
        {sc(lesson.title)}
      </Text>

      {options.map((opt, i) => {
        const isSelected = selected === i
        const feedbackBg =
          opt.variant === 'pro-move'
            ? colors.successBg
            : opt.variant === 'red-flag'
            ? colors.dangerBg
            : colors.warningBg
        const feedbackColor =
          opt.variant === 'pro-move'
            ? colors.successText
            : opt.variant === 'red-flag'
            ? colors.dangerText
            : colors.warningText
        const feedbackLabel =
          opt.variant === 'pro-move'
            ? '✅ Pro move'
            : opt.variant === 'red-flag'
            ? '🚩 Red flag'
            : opt.correct
            ? '✅ Correct'
            : '✗ Not quite'

        return (
          <View key={i} style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => select(i)}
              style={[
                styles.optionBtn,
                {
                  borderColor: isSelected ? brand.purpleCTA : colors.borderWeak,
                  borderWidth: isSelected ? 1.5 : 0.5,
                  backgroundColor: isSelected ? 'rgba(91,92,246,0.12)' : '#FFFFFF',
                  opacity: selected !== null && !isSelected ? 0.45 : 1,
                },
              ]}
            >
              <Text style={[type.body, { color: colors.textPrimary, lineHeight: 18 }]}>
                {opt.label}
              </Text>
            </Pressable>

            {isSelected && opt.feedback && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={[
                  styles.feedbackCard,
                  { backgroundColor: feedbackBg, borderLeftColor: feedbackColor },
                ]}
              >
                <Text style={[type.label, { color: feedbackColor, marginBottom: 4, textTransform: 'none' }]}>
                  {feedbackLabel}
                </Text>
                <Text style={[type.body, { color: feedbackColor, lineHeight: 18 }]}>
                  {opt.feedback}
                </Text>
              </Animated.View>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>()
  const { currentLesson, advanceLesson } = useLearnStore()

  const module = modules.find((m) => m.id === moduleId)
  const lessons = module?.lessons ?? []
  const lesson = lessons[currentLesson]

  const [canAdvance, setCanAdvance] = useState(false)
  const isLast = currentLesson >= lessons.length - 1

  // Reset canAdvance each time lesson changes; text-visual needs no interaction
  useEffect(() => {
    setCanAdvance(lesson?.type === 'text-visual')
  }, [currentLesson])

  const handleReady = useCallback(() => setCanAdvance(true), [])

  function handleNext() {
    if (isLast) {
      router.replace(`/learn/${moduleId}/complete`)
    } else {
      advanceLesson()
    }
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[type.body, { color: colors.textSecondary }]}>Loading…</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />

      {/* Fixed header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            paddingHorizontal: spacing.screenH,
            borderBottomColor: colors.borderWeak,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ArrowIcon size={20} color="#5B5CF6" direction="left" />
          </Pressable>
        </View>

        <ProgressDots total={lessons.length} current={currentLesson} />
      </View>

      {/* Lesson content — key forces full child state reset on lesson change */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 110,
          paddingHorizontal: spacing.screenH,
        }}
      >
        <View key={currentLesson}>
          <View style={[styles.typeChip, { backgroundColor: '#B1FF58', alignSelf: 'flex-start', marginBottom: 14 }]}>
            <Text style={[type.label, { color: '#1A4A00', textTransform: 'uppercase' }]}>
              {TYPE_LABELS[lesson.type] ?? lesson.type}
            </Text>
          </View>
          {lesson.type === 'text-visual' && <TextVisualLesson lesson={lesson} />}

          {lesson.type === 'swipe-reveal' && (
            <SwipeRevealLesson lesson={lesson} onReady={handleReady} />
          )}

          {lesson.type === 'tap-uncover' && (
            <TapUncoverLesson lesson={lesson} onReady={handleReady} />
          )}

          {(lesson.type === 'scenario' || lesson.type === 'quick-check') && (
            <ChoiceLesson lesson={lesson} onReady={handleReady} />
          )}
        </View>
      </ScrollView>

      {/* Fixed bottom CTA — fades in when ready */}
      {canAdvance && (
        <Animated.View
          entering={FadeIn.duration(250)}
          style={[
            styles.bottomBar,
            {
              paddingBottom: 16,
              paddingHorizontal: spacing.screenH,
              backgroundColor: '#FFFFFF',
              borderTopColor: colors.borderWeak,
            },
          ]}
        >
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: brand.purpleCTA, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[type.cardTitle, { color: '#FFFFFF' }]}>
              {isLast ? 'finish →' : 'next →'}
            </Text>
          </Pressable>
        </Animated.View>
      )}
      <BottomNav activeTab="learn" />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  typeChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  insightCard: {
    borderRadius: 12,
    padding: 14,
  },
  revealCard: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  revealOverlay: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  hotspotPill: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  explanationCard: {
    borderRadius: 12,
    padding: 14,
  },
  optionBtn: {
    borderRadius: 12,
    padding: 14,
  },
  feedbackCard: {
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    borderLeftWidth: 3,
  },
  bottomBar: {
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  nextBtn: {
    borderRadius: 50,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
})
