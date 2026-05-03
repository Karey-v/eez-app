// S13–S22 — Leakability Test Questions (dynamic, type-driven)
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

// ─── Sim helpers ──────────────────────────────────────────────────────────────

const INTERNAL_SIM_TYPES = [
  'notification', 'message', 'email', 'ios-update',
  'wifi-settings', 'reward-popup', 'message-actions', 'instagram-dm', 'browser',
]

function getSimBgColor(uiType: string): string {
  switch (uiType) {
    case 'notification':    return '#1C1C1E'
    case 'instagram-dm':   return '#1C1C1E'
    case 'reward-popup':   return '#808080'
    case 'wifi-settings':  return '#000000'
    case 'message':
    case 'message-actions': return '#F2F2F7'
    case 'ios-update':     return '#F2F2F7'
    case 'email':          return '#FFFFFF'
    case 'browser':        return '#FFFFFF'
    default:               return '#FFFFFF'
  }
}

function isSimDark(uiType: string): boolean {
  return ['notification', 'instagram-dm', 'reward-popup', 'wifi-settings'].includes(uiType)
}

// ─── Score calculation ────────────────────────────────────────────────────────

function computeResults(answers: { questionId: number; score: number; category: string }[]) {
  const rawScore = answers.reduce((sum, a) => sum + a.score, 0)
  const scaledScore = scaleScore(rawScore)
  const band = getBand(scaledScore)
  const byId: Record<number, number> = {}
  answers.forEach((a) => { byId[a.questionId] = a.score })
  return {
    scaledScore,
    band,
    categoryScores: {
      passwords: byId[2] ?? 0,
      device:    byId[5] ?? 0,
      messages:  (byId[3] ?? 0) + (byId[8] ?? 0) + (byId[9] ?? 0),
      phishing:  (byId[4] ?? 0) + (byId[10] ?? 0),
      scams:     (byId[1] ?? 0) + (byId[6] ?? 0) + (byId[7] ?? 0),
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
          style={[styles.progressLine, { backgroundColor: i <= current ? '#5B5CF6' : '#EEF0FF' }]}
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
  const uiType = question.simulation?.uiType ?? ''
  const isInternalSim =
    question.type === 'simulation-tap' &&
    !!question.simulation &&
    INTERNAL_SIM_TYPES.includes(uiType)

  const screenBg = isInternalSim ? getSimBgColor(uiType) : '#FFFFFF'
  const dark = isInternalSim && isSimDark(uiType)

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
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <StatusBar style={dark ? 'light' : 'dark'} />

      {/* Fixed header — only for non-simulation questions */}
      {!isInternalSim && (
        <View style={{ paddingTop: insets.top, paddingHorizontal: spacing.screenH }}>
          <ProgressLines total={questions.length} current={currentQuestionIndex} />
          <View style={[styles.categoryPill, { marginTop: 28 }]}>
            <Text style={styles.categoryPillText}>{question.category}</Text>
          </View>
        </View>
      )}

      <QuestionBody
        key={currentQuestionIndex}
        question={question}
        onAnswer={handleAnswer}
        onAdvance={handleAdvance}
        onBack={handleBack}
        initialSelectedIndex={initialSelectedIndex}
        isInternalSim={isInternalSim}
        uiType={uiType}
      />

      {!isInternalSim && <BottomNav activeTab="home" />}
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
  isInternalSim,
  uiType,
}: {
  question: Question
  onAnswer: (optionIndex: number) => void
  onAdvance: () => void
  onBack: () => void
  initialSelectedIndex: number | null
  isInternalSim: boolean
  uiType: string
}) {
  const { colors, type, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
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
    advanceTimerRef.current = setTimeout(onAdvance, 800)
  }

  function handleSliderChange(index: number) {
    setSliderIndex(index)
    setDisplayIndex(index)
    onAnswer(index)
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current)
    advanceTimerRef.current = setTimeout(onAdvance, 800)
  }

  // ── Full-screen simulation layout ──
  if (isInternalSim) {
    const backColor = isSimDark(uiType) ? 'rgba(255,255,255,0.55)' : '#9CA3AF'
    return (
      <View style={{ flex: 1 }}>
        <SimulationCard
          simulation={question.simulation!}
          onTap={handleOptionSelect}
          selectedIndex={displayIndex}
          anySelected={selectedIndex !== null}
          options={question.options}
        />
        <Pressable
          onPress={onBack}
          hitSlop={16}
          style={[styles.floatingBack, { top: insets.top + 10 }]}
        >
          <Text style={[styles.floatingBackText, { color: backColor }]}>← back</Text>
        </Pressable>
      </View>
    )
  }

  // ── Standard layout (slider, scenario, MCQ) ──
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.body,
          { paddingHorizontal: spacing.screenH, paddingTop: 32, paddingBottom: 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        {question.type === 'scenario' && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.questionText}>{cap(question.prompt ?? '')}</Text>
          </View>
        )}

        {question.type === 'multiple-choice' && (
          <Text style={[styles.questionText, { marginBottom: 40 }]}>
            {cap(question.prompt ?? '')}
          </Text>
        )}

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
  onTap,
  selectedIndex,
  anySelected,
  options,
}: {
  simulation: NonNullable<Question['simulation']>
  onTap?: (index: number) => void
  selectedIndex?: number | null
  anySelected?: boolean
  options?: NonNullable<Question['options']>
}) {
  const { colors, type } = useTheme()
  const insets = useSafeAreaInsets()
  const [expanded, setExpanded] = useState(false)
  const [chipsOpen, setChipsOpen] = useState(false)
  const { uiType, sender, content, preview } = simulation

  const initials = sender
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // ── Wi-Fi settings (dark mode) ────────────────────────────────────────────
  if (uiType === 'wifi-settings') {
    const rowMeta = [
      { bars: 3, open: true },
      { bars: 2, open: false },
      { bars: 0, badge: '4G' },
      { bars: 0, badge: 'VPN' },
    ] as { bars: number; open?: boolean; badge?: string }[]

    return (
      <View style={styles.wifiContainer}>
        <View style={[styles.wifiStatusBar, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.wifiStatusTime}>9:41</Text>
          <Text style={styles.wifiStatusRight}>●●●</Text>
        </View>
        <View style={styles.wifiTitleRow}>
          <Text style={styles.wifiBackChevron}>‹ Settings</Text>
          <Text style={styles.wifiTitle}>Wi-Fi</Text>
        </View>
        <View style={styles.wifiList}>
          <Text style={styles.wifiSectionLabel}>NETWORKS</Text>
          {(options ?? []).map((opt, i) => {
            const meta = rowMeta[i] ?? { bars: 2 }
            const isSelected = selectedIndex === i
            const isLast = i === (options?.length ?? 0) - 1
            return (
              <Pressable
                key={i}
                onPress={() => { if (!anySelected) onTap?.(i) }}
                style={[
                  styles.wifiRow,
                  !isLast && styles.wifiRowDivider,
                  isSelected && { backgroundColor: 'rgba(91,92,246,0.18)' },
                ]}
              >
                {meta.badge ? (
                  <View style={styles.wifiBadge}>
                    <Text style={styles.wifiBadgeText}>{meta.badge}</Text>
                  </View>
                ) : (
                  <View style={styles.wifiSignalWrap}>
                    {[5, 8, 11, 14].map((h, barIdx) => (
                      <View
                        key={barIdx}
                        style={{
                          width: 3, height: h, borderRadius: 1,
                          backgroundColor: barIdx < meta.bars
                            ? isSelected ? '#5B5CF6' : '#007AFF'
                            : 'rgba(255,255,255,0.2)',
                        }}
                      />
                    ))}
                  </View>
                )}
                <Text style={[styles.wifiRowLabel, isSelected && { color: '#5B5CF6', fontFamily: 'Inter_700Bold' }]}>
                  {opt.label}
                </Text>
                {meta.open === true && <Text style={styles.wifiLockIcon}>🔓</Text>}
                {meta.open === false && i < 2 && <Text style={styles.wifiLockIcon}>🔒</Text>}
                {isSelected && <Text style={styles.wifiCheck}>✓</Text>}
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  // ── Reward popup ──────────────────────────────────────────────────────────
  if (uiType === 'reward-popup') {
    return (
      <View style={[styles.rewardDim, { paddingTop: insets.top + 24 }]}>
        <View style={styles.rewardCard}>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(1) }}
            style={[styles.rewardCloseBtn, selectedIndex === 1 && { backgroundColor: 'rgba(91,92,246,0.2)' }]}
          >
            <Text style={styles.rewardCloseTxt}>✕</Text>
          </Pressable>
          <Text style={styles.rewardGift}>🎁</Text>
          <Text style={styles.rewardTitle}>You've been selected!</Text>
          <Text style={styles.rewardBody}>{content}</Text>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(0) }}
            style={[styles.rewardClaimBtn, selectedIndex === 0 && { backgroundColor: '#7C3AED' }]}
          >
            <Text style={styles.rewardClaimTxt}>Claim my reward</Text>
          </Pressable>
          <Pressable onPress={() => { if (!anySelected) onTap?.(2) }} style={{ marginTop: 12 }}>
            <Text style={[styles.rewardTermsTxt, selectedIndex === 2 && { color: '#5B5CF6', fontFamily: 'Inter_700Bold' }]}>
              Terms & Conditions
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  // ── iMessage + action buttons (Q8) ────────────────────────────────────────
  if (uiType === 'message-actions') {
    return (
      <View style={styles.iMessageContainer}>
        <View style={[styles.iMessageHeader, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
          <View style={[styles.iMessageAvatar, { backgroundColor: '#8E8E93' }]}>
            <Text style={styles.iMessageAvatarText}>{initials || '?'}</Text>
          </View>
          <View>
            <Text style={styles.iMessageSenderName}>{sender}</Text>
            <Text style={styles.iMessageMeta}>Unknown Caller</Text>
          </View>
        </View>
        <View style={styles.iMessageChatArea}>
          <View style={styles.iMessageBubbleRow}>
            <View style={[styles.iMessageAvatarSmall, { backgroundColor: '#8E8E93' }]}>
              <Text style={styles.iMessageAvatarSmallText}>{initials || '?'}</Text>
            </View>
            <View style={styles.iMessageBubble}>
              <Text style={styles.iMessageBubbleText}>{content}</Text>
            </View>
          </View>
          <Text style={styles.iMessageDelivered}>delivered</Text>
        </View>
        <View style={styles.msgActionBar}>
          {(options ?? []).map((opt, i) => (
            <Pressable
              key={i}
              onPress={() => { if (!anySelected) onTap?.(i) }}
              style={[
                styles.msgActionBtn,
                i < (options?.length ?? 1) - 1 && styles.msgActionBtnDivider,
                selectedIndex === i && { backgroundColor: 'rgba(91,92,246,0.08)' },
              ]}
            >
              <Text style={[styles.msgActionTxt, i === 0 ? { color: '#FF3B30' } : { color: '#007AFF' }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }

  // ── Instagram DM (Q9) ─────────────────────────────────────────────────────
  if (uiType === 'instagram-dm') {
    const linkMatch = content.match(/bit\.ly\/\S+/)
    const linkText = linkMatch ? linkMatch[0] : ''
    const beforeLink = linkText ? content.slice(0, content.indexOf(linkText)) : content
    const afterLink = linkText ? content.slice(content.indexOf(linkText) + linkText.length) : ''

    return (
      <View style={styles.igContainer}>
        <View style={[styles.igHeader, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
          <View style={[styles.igAvatarMed, { backgroundColor: '#C837AB' }]}>
            <Text style={styles.igAvatarMedTxt}>{initials || '?'}</Text>
          </View>
          <View>
            <Text style={styles.igUsername}>{sender}</Text>
            <Text style={styles.igSubtitle}>Active now</Text>
          </View>
        </View>
        <View style={styles.igChatArea}>
          <View style={[styles.igAvatarSm, { backgroundColor: '#C837AB' }]}>
            <Text style={styles.igAvatarSmTxt}>{initials || '?'}</Text>
          </View>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(0) }}
            style={[styles.igBubble, selectedIndex === 0 && { borderColor: '#5B5CF6', borderWidth: 1.5 }]}
          >
            <Text style={styles.igBubbleTxt}>
              {beforeLink}
              {linkText ? (
                <Text style={[styles.igLinkTxt, selectedIndex === 0 && { color: '#B1FF58' }]}>
                  {linkText}
                </Text>
              ) : null}
              {afterLink}
            </Text>
          </Pressable>
        </View>
        <View style={styles.igActionBar}>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(1) }}
            style={[styles.igActionBtn, styles.igActionBtnDivider, selectedIndex === 1 && { backgroundColor: 'rgba(91,92,246,0.1)' }]}
          >
            <Text style={styles.igActionTxt}>Reply</Text>
          </Pressable>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(2) }}
            style={[styles.igActionBtn, selectedIndex === 2 && { backgroundColor: 'rgba(255,59,48,0.1)' }]}
          >
            <Text style={[styles.igActionTxt, { color: '#FF3B30' }]}>Report & Delete</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  // ── Browser (Q10) ─────────────────────────────────────────────────────────
  if (uiType === 'browser') {
    return (
      <View style={styles.browserContainer}>
        <Pressable
          onPress={() => { if (!anySelected) onTap?.(1) }}
          style={[
            styles.browserURLBar,
            { marginTop: insets.top + 10 },
            selectedIndex === 1 && { backgroundColor: 'rgba(91,92,246,0.08)', borderColor: '#5B5CF6', borderWidth: 1 },
          ]}
        >
          <Text style={styles.browserWarningIcon}>⚠️</Text>
          <Text style={styles.browserURLText} numberOfLines={1}>{sender}</Text>
          <Text style={styles.browserMenuDots}>···</Text>
        </Pressable>
        <Pressable
          onPress={() => { if (!anySelected) onTap?.(0) }}
          style={[styles.browserPage, selectedIndex === 0 && { backgroundColor: 'rgba(91,92,246,0.03)' }]}
        >
          <Text style={styles.browserPageTitle}>{content}</Text>
          <View style={[styles.browserField, selectedIndex === 0 && { borderColor: '#5B5CF6' }]}>
            <Text style={styles.browserFieldLabel}>Email</Text>
            <Text style={styles.browserFieldHint}>your@email.com</Text>
          </View>
          <View style={[styles.browserField, { marginTop: 10 }, selectedIndex === 0 && { borderColor: '#5B5CF6' }]}>
            <Text style={styles.browserFieldLabel}>Password</Text>
            <Text style={styles.browserFieldHint}>••••••••</Text>
          </View>
          <View style={[styles.browserSignInBtn, selectedIndex === 0 && { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.browserSignInTxt}>Sign In</Text>
          </View>
        </Pressable>
      </View>
    )
  }

  // ── iOS lockscreen notification (Q1) ──────────────────────────────────────
  if (uiType === 'notification') {
    return (
      <View style={[styles.iosLockscreen, { paddingTop: insets.top + 22 }]}>
        <Text style={styles.lockTime}>9:41</Text>
        <Text style={styles.lockDate}>Wednesday, May 2</Text>
        <Pressable
          onPress={() => { if (!anySelected) onTap?.(0) }}
          style={[
            styles.iosNotifBanner,
            selectedIndex === 0 && { borderWidth: 1.5, borderColor: 'rgba(255,59,48,0.6)' },
          ]}
        >
          <View style={styles.iosNotifTopRow}>
            <View style={[styles.iosNotifAppIcon, { backgroundColor: '#5B5CF6' }]}>
              <Text style={styles.iosNotifIconText}>{initials || '?'}</Text>
            </View>
            <Text style={styles.iosNotifAppName}>{sender}</Text>
            <Text style={styles.iosNotifTime}>now</Text>
          </View>
          {preview && <Text style={styles.iosNotifTitle} numberOfLines={1}>{preview}</Text>}
          <Text style={styles.iosNotifBody} numberOfLines={3}>{content}</Text>
        </Pressable>
        {!expanded ? (
          <Pressable onPress={() => setExpanded(true)} style={styles.notifSwipeHint}>
            <Text style={styles.notifSwipeHintText}>swipe for options ↓</Text>
          </Pressable>
        ) : (
          <View style={styles.notifActionRow}>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(1) }}
              style={[
                styles.notifActionBtn,
                { borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.15)' },
                selectedIndex === 1 && { backgroundColor: 'rgba(0,149,255,0.18)' },
              ]}
            >
              <Text style={[styles.notifActionTxt, { color: '#007AFF' }]}>Ignore</Text>
            </Pressable>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(2) }}
              style={[styles.notifActionBtn, selectedIndex === 2 && { backgroundColor: 'rgba(255,59,48,0.12)' }]}
            >
              <Text style={[styles.notifActionTxt, { color: '#FF3B30' }]}>Mark as Spam</Text>
            </Pressable>
          </View>
        )}
      </View>
    )
  }

  // ── iMessage with reply chips (Q3) ────────────────────────────────────────
  if (uiType === 'message') {
    return (
      <View style={styles.iMessageContainer}>
        <View style={[styles.iMessageHeader, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(3) }}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.iMsgBackChevron}>‹ Messages</Text>
          </Pressable>
          <View style={[styles.iMessageAvatar, { backgroundColor: '#34C759' }]}>
            <Text style={styles.iMessageAvatarText}>{initials || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
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
        {!chipsOpen ? (
          <Pressable onPress={() => setChipsOpen(true)} style={styles.iMsgInputBar}>
            <Text style={styles.iMsgInputPlaceholder}>Message</Text>
            <Text style={styles.iMsgSendBtn}>⬆</Text>
          </Pressable>
        ) : (
          <View style={styles.iMsgChipsWrap}>
            {(options ?? []).slice(0, 3).map((opt, i) => (
              <Pressable
                key={i}
                onPress={() => { if (!anySelected) onTap?.(i) }}
                style={[styles.iMsgChip, selectedIndex === i && { backgroundColor: '#5B5CF6', borderColor: '#5B5CF6' }]}
              >
                <Text style={[styles.iMsgChipTxt, selectedIndex === i && { color: '#FFFFFF' }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    )
  }

  // ── Email viewer (Q4) ─────────────────────────────────────────────────────
  if (uiType === 'email') {
    const btnColors = ['#FF3B30', '#FF9500', '#34C759', '#007AFF']
    return (
      <View style={styles.emailViewer}>
        <View style={[styles.emailViewerHeader, { paddingTop: insets.top + 14, paddingBottom: 10 }]}>
          <View style={[styles.emailAvatar, { backgroundColor: '#FF3B30' }]}>
            <Text style={styles.emailAvatarText}>{initials || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emailViewerSender} numberOfLines={1}>{sender}</Text>
            {preview && <Text style={styles.emailViewerSubject} numberOfLines={1}>{preview}</Text>}
          </View>
          <Text style={styles.emailViewerTime}>now</Text>
        </View>
        <Text style={styles.emailViewerBody} numberOfLines={3}>{content}</Text>
        <Text style={styles.emailViewerLink}>Verify my account →</Text>
        <View style={styles.emailActionGrid}>
          {[0, 1].map((row) => (
            <View key={row} style={{ flexDirection: 'row', gap: 8 }}>
              {[0, 1].map((col) => {
                const i = row * 2 + col
                const opt = (options ?? [])[i]
                if (!opt) return null
                const color = btnColors[i] ?? '#007AFF'
                const active = selectedIndex === i
                return (
                  <Pressable
                    key={i}
                    onPress={() => { if (!anySelected) onTap?.(i) }}
                    style={[styles.emailActionBtn, { flex: 1, borderColor: color, backgroundColor: active ? color : color + '18' }]}
                  >
                    <Text style={[styles.emailActionTxt, { color: active ? '#FFFFFF' : color }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ))}
        </View>
      </View>
    )
  }

  // ── iOS software update (Q5) ──────────────────────────────────────────────
  if (uiType === 'ios-update') {
    return (
      <View style={styles.iosUpdateContainer}>
        <View style={[styles.iosUpdateNavBar, { paddingTop: insets.top + 14, paddingBottom: 12 }]}>
          <Text style={styles.iosUpdateBack}>‹ General</Text>
          <Text style={styles.iosUpdateTitle}>Software Update</Text>
          <Text style={{ width: 60 }} />
        </View>
        <View style={styles.iosUpdateCard}>
          <View style={styles.iosUpdateIconRow}>
            <View style={styles.iosUpdateIcon}>
              <Text style={styles.iosUpdateIconTxt}>iOS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.iosUpdateVersion}>{sender}</Text>
              <Text style={styles.iosUpdateSize}>1.2 GB</Text>
            </View>
          </View>
          <Text style={styles.iosUpdateBody} numberOfLines={2}>{content}</Text>
        </View>
        {(options ?? []).map((opt, i) => (
          <Pressable
            key={i}
            onPress={() => { if (!anySelected) onTap?.(i) }}
            style={[
              i === 0 ? styles.iosUpdatePrimaryBtn : styles.iosUpdateSecondaryRow,
              selectedIndex === i && i === 0 && { backgroundColor: '#0A5AD4' },
              selectedIndex === i && i !== 0 && { backgroundColor: 'rgba(91,92,246,0.07)' },
            ]}
          >
            <Text style={[
              i === 0 ? styles.iosUpdatePrimaryTxt : styles.iosUpdateSecondaryTxt,
              i === 3 && { color: '#FF3B30' },
              selectedIndex === i && i !== 0 && { color: '#5B5CF6' },
            ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    )
  }

  // ── Alert fallback ────────────────────────────────────────────────────────
  return (
    <View style={[styles.simCardAlert, { backgroundColor: colors.dangerBg, borderColor: colors.dangerText }]}>
      <Text style={[type.cardTitle, { color: colors.dangerText }]}>{sender}</Text>
      <Text style={[type.body, { color: colors.textPrimary, marginTop: 6, lineHeight: 18 }]}>{content}</Text>
    </View>
  )
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({
  label, selected, anySelected, onPress,
}: {
  label: string; selected: boolean; anySelected: boolean; onPress: () => void
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
  options, labels, selectedIndex, onChange,
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

  // ── Floating back button (internal sims) ──
  floatingBack: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  floatingBackText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  // ── Bottom nav bar (non-sim questions) ──
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // ── WiFi settings (dark mode) ──
  wifiContainer: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  wifiStatusBar: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  wifiStatusTime: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  wifiStatusRight: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  wifiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  wifiBackChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#007AFF',
  },
  wifiTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 60,
  },
  wifiList: {
    backgroundColor: '#1C1C1E',
  },
  wifiSectionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  wifiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#1C1C1E',
    gap: 10,
  },
  wifiRowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  wifiSignalWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    width: 20,
  },
  wifiBadge: {
    backgroundColor: '#5B5CF6',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    width: 20,
    alignItems: 'center',
  },
  wifiBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    color: '#FFFFFF',
  },
  wifiRowLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  wifiLockIcon: {
    fontSize: 13,
  },
  wifiCheck: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#5B5CF6',
  },

  // ── Reward popup ──
  rewardDim: {
    flex: 1,
    backgroundColor: '#808080',
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  rewardCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCloseTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#8E8E93',
  },
  rewardGift: {
    fontSize: 44,
    marginBottom: 12,
    marginTop: 8,
  },
  rewardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: '#0A0A0A',
    marginBottom: 6,
    textAlign: 'center',
  },
  rewardBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  rewardClaimBtn: {
    backgroundColor: '#5B5CF6',
    borderRadius: 50,
    height: 44,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardClaimTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  rewardTermsTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },

  // ── iMessage (shared for message + message-actions) ──
  iMessageContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
  },
  iMessageHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
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
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    justifyContent: 'flex-end',
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

  // ── iMessage action bar (Q8) ──
  msgActionBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  msgActionBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgActionBtnDivider: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  msgActionTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },

  // ── iMessage chips (Q3) ──
  iMsgBackChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4,
  },
  iMsgInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  iMsgInputPlaceholder: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  iMsgSendBtn: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#007AFF',
  },
  iMsgChipsWrap: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.08)',
    padding: 10,
    gap: 8,
  },
  iMsgChip: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.35)',
    backgroundColor: 'rgba(0,122,255,0.05)',
  },
  iMsgChipTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#007AFF',
  },

  // ── Instagram DM ──
  igContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  igHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  igAvatarMed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarMedTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  igUsername: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  igSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 1,
  },
  igChatArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  igAvatarSm: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  igAvatarSmTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  igBubble: {
    backgroundColor: '#2C2C2E',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  igBubbleTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  igLinkTxt: {
    color: '#007AFF',
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  igActionBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  igActionBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igActionBtnDivider: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  igActionTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#007AFF',
  },

  // ── Browser ──
  browserContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  browserURLBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  browserWarningIcon: {
    fontSize: 14,
  },
  browserURLText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#FF3B30',
    flex: 1,
  },
  browserMenuDots: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#8E8E93',
    letterSpacing: 1,
  },
  browserPage: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  browserPageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#0A0A0A',
    marginBottom: 16,
    textAlign: 'center',
  },
  browserField: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  browserFieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  browserFieldHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(0,0,0,0.25)',
  },
  browserSignInBtn: {
    backgroundColor: '#5B5CF6',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  browserSignInTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },

  // ── iOS lockscreen notification ──
  iosLockscreen: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 18,
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
  notifSwipeHint: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  notifSwipeHintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.3,
  },
  notifActionRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
    width: '100%',
  },
  notifActionBtn: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  notifActionTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },

  // ── Email viewer ──
  emailViewer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  emailViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
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
  emailViewerSender: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#0A0A0A',
  },
  emailViewerSubject: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  emailViewerTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    flexShrink: 0,
  },
  emailViewerBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#4B5563',
    paddingHorizontal: 14,
    paddingTop: 10,
    lineHeight: 19,
  },
  emailViewerLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    textDecorationLine: 'underline',
  },
  emailActionGrid: {
    gap: 8,
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  emailActionBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  emailActionTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },

  // ── iOS update screen ──
  iosUpdateContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
  },
  iosUpdateNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iosUpdateBack: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#007AFF',
    width: 70,
  },
  iosUpdateTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0A0A0A',
  },
  iosUpdateCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 2,
  },
  iosUpdateIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iosUpdateIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosUpdateIconTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  iosUpdateVersion: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
  },
  iosUpdateSize: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  iosUpdateBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  iosUpdatePrimaryBtn: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  iosUpdatePrimaryTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  iosUpdateSecondaryRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  iosUpdateSecondaryTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#007AFF',
  },

  // ── Alert fallback ──
  simCardAlert: {
    flex: 1,
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
