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
import { LinearGradient } from 'expo-linear-gradient'

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ─── Sim helpers ──────────────────────────────────────────────────────────────

const INTERNAL_SIM_TYPES = [
  'notification', 'message', 'email',
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
    case 'email':          return '#1C2633'
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
      device:    0,
      messages:  (byId[3] ?? 0) + (byId[7] ?? 0) + (byId[8] ?? 0),
      phishing:  (byId[4] ?? 0) + (byId[9] ?? 0),
      scams:     (byId[1] ?? 0) + (byId[5] ?? 0) + (byId[6] ?? 0),
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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />

      {/* Fixed header — all questions */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: spacing.screenH, paddingBottom: 8 }}>
        <ProgressLines total={questions.length} current={currentQuestionIndex} />
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => [{ marginTop: 10, alignSelf: 'flex-start', opacity: pressed ? 0.5 : 1 }]}
        >
          <Text style={styles.navBackText}>← back</Text>
        </Pressable>
        <View style={[styles.categoryPill, { marginTop: 8 }]}>
          <Text style={styles.categoryPillText}>{question.category}</Text>
        </View>
      </View>

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

  // ── Simulation layout ──
  if (isInternalSim) {
    return (
      <View style={{ flex: 1 }}>
        <SimulationCard
          simulation={question.simulation!}
          onTap={handleOptionSelect}
          selectedIndex={displayIndex}
          anySelected={selectedIndex !== null}
          options={question.options}
        />
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
  const { uiType, sender, content, preview } = simulation

  const initials = sender
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // ── Wi-Fi settings (light mode) ──────────────────────────────────────────
  if (uiType === 'wifi-settings') {
    const networkMeta = [{ bars: 3, locked: false }, { bars: 2, locked: true }]
    const networkOpts = (options ?? []).slice(0, 2)
    const actionOpts = (options ?? []).slice(2)

    return (
      <View style={styles.wifiContainer}>
        <View style={[styles.wifiStatusBar, { paddingTop: 8 }]}>
          <Text style={styles.wifiStatusTime}>9:41</Text>
          <Text style={styles.wifiStatusRight}>●●●</Text>
        </View>
        <View style={styles.wifiTitleRow}>
          <Text style={styles.wifiBackChevron}>‹ Settings</Text>
          <Text style={styles.wifiTitle}>Wi-Fi</Text>
        </View>
        <View style={styles.wifiList}>
          <Text style={styles.wifiSectionLabel}>NETWORKS</Text>
          {networkOpts.map((opt, i) => {
            const meta = networkMeta[i]
            const isSelected = selectedIndex === i
            const isLast = i === networkOpts.length - 1
            return (
              <Pressable
                key={i}
                onPress={() => { if (!anySelected) onTap?.(i) }}
                style={[
                  styles.wifiRow,
                  !isLast && styles.wifiRowDivider,
                  isSelected && { backgroundColor: 'rgba(91,92,246,0.08)' },
                ]}
              >
                <View style={styles.wifiSignalWrap}>
                  {[5, 8, 11, 14].map((h, barIdx) => (
                    <View
                      key={barIdx}
                      style={{
                        width: 3, height: h, borderRadius: 1,
                        backgroundColor: barIdx < meta.bars
                          ? isSelected ? '#5B5CF6' : '#007AFF'
                          : 'rgba(0,0,0,0.15)',
                      }}
                    />
                  ))}
                </View>
                <Text style={[styles.wifiRowLabel, isSelected && { color: '#5B5CF6', fontFamily: 'Inter_700Bold' }]}>
                  {opt.label}
                </Text>
                {meta.locked && <Text style={styles.wifiLockIcon}>🔒</Text>}
                {isSelected && <Text style={styles.wifiCheck}>✓</Text>}
              </Pressable>
            )
          })}
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.wifiActionBtns}>
          {actionOpts.map((opt, i) => {
            const globalIdx = i + 2
            const isSelected = selectedIndex === globalIdx
            const isPrimary = i === 0
            return (
              <Pressable
                key={globalIdx}
                onPress={() => { if (!anySelected) onTap?.(globalIdx) }}
                style={[
                  isPrimary ? styles.wifiActionPrimary : styles.wifiActionSecondary,
                  isSelected && isPrimary && { backgroundColor: '#4A4AE0' },
                  isSelected && !isPrimary && { backgroundColor: 'rgba(91,92,246,0.12)' },
                  anySelected && !isSelected && { opacity: 0.45 },
                ]}
              >
                <Text style={isPrimary ? styles.wifiActionPrimaryTxt : styles.wifiActionSecondaryTxt}>
                  {opt.label}
                </Text>
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
        <Pressable
          onPress={() => { if (!anySelected) onTap?.(3) }}
          style={[
            styles.rewardReportBtn,
            selectedIndex === 3 && { backgroundColor: 'rgba(255,255,255,0.2)' },
            anySelected && selectedIndex !== 3 && { opacity: 0.45 },
          ]}
        >
          <Text style={styles.rewardReportTxt}>Report This</Text>
        </Pressable>
      </View>
    )
  }

  // ── iMessage + action buttons (Q8) ────────────────────────────────────────
  if (uiType === 'message-actions') {
    return (
      <View style={styles.iMessageContainer}>
        <View style={[styles.iMessageHeader, { paddingTop: 8, paddingBottom: 12 }]}>
          <View style={[styles.iMessageAvatar, { backgroundColor: '#8E8E93' }]}>
            <Text style={styles.iMessageAvatarText}>{initials || '?'}</Text>
          </View>
          <View>
            <Text style={styles.iMessageSenderName}>{sender}</Text>
            <Text style={styles.iMessageMeta}>Unknown Caller</Text>
          </View>
        </View>
        <View style={[styles.iMessageChatArea, { justifyContent: 'flex-start' }]}>
          <View style={styles.iMessageBubbleRow}>
            <View style={[styles.iMessageAvatarSmall, { backgroundColor: '#8E8E93' }]}>
              <Text style={styles.iMessageAvatarSmallText}>{initials || '?'}</Text>
            </View>
            <View style={styles.iMessageBubble}>
              <Text style={[styles.iMessageBubbleText, { fontSize: 12, lineHeight: 17 }]}>{content}</Text>
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
        <View style={[styles.igHeader, { paddingTop: 8, paddingBottom: 12 }]}>
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

  // ── Browser / phishing popup (Q10) ──────────────────────────────────────
  if (uiType === 'browser') {
    return (
      <View style={styles.browserContainer}>
        {/* Dimmed fake browser behind popup */}
        <View style={[styles.browserURLBar, { marginTop: 10, opacity: 0.4 }]}>
          <Text style={styles.browserWarningIcon}>⚠️</Text>
          <Text style={styles.browserURLText} numberOfLines={1}>{sender}</Text>
          <Text style={styles.browserMenuDots}>···</Text>
        </View>
        <View style={[styles.browserPage, { opacity: 0.3 }]}>
          <Text style={styles.browserPageTitle}>{content}</Text>
          <View style={styles.browserField}>
            <Text style={styles.browserFieldLabel}>Email</Text>
            <Text style={styles.browserFieldHint}>your@email.com</Text>
          </View>
          <View style={[styles.browserField, { marginTop: 10 }]}>
            <Text style={styles.browserFieldLabel}>Password</Text>
            <Text style={styles.browserFieldHint}>••••••••</Text>
          </View>
        </View>
        {/* Security popup overlay */}
        <View style={styles.browserPopupOverlay}>
          <View style={styles.browserPopupCard}>
            <Text style={styles.browserPopupIcon}>⚠️</Text>
            <Text style={styles.browserPopupTitle}>Suspicious Site Detected</Text>
            <Text style={styles.browserPopupSubtitle}>
              This page may be a phishing site trying to steal your login details.
            </Text>
            <Text style={styles.browserPopupURL}>{sender}</Text>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(0) }}
              style={[
                styles.browserPopupDangerBtn,
                selectedIndex === 0 && { backgroundColor: '#CC1500' },
                anySelected && selectedIndex !== 0 && { opacity: 0.45 },
              ]}
            >
              <Text style={styles.browserPopupDangerTxt}>Open Website</Text>
            </Pressable>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(1) }}
              style={[
                styles.browserPopupSafeBtn,
                selectedIndex === 1 && { backgroundColor: 'rgba(0,122,255,0.12)' },
                anySelected && selectedIndex !== 1 && { opacity: 0.45 },
              ]}
            >
              <Text style={styles.browserPopupSafeTxt}>Report</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  // ── iOS lockscreen notification (Q1) ──────────────────────────────────────
  if (uiType === 'notification') {
    return (
      <LinearGradient
        colors={['#1B0E52', '#3B2DA0', '#5B5CF6']}
        style={[styles.iosLockscreen, { paddingTop: insets.top + 22 }]}
      >
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
        <View style={styles.notifActionRow}>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(1) }}
            style={[
              styles.notifActionBtn,
              { borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.15)' },
              selectedIndex === 1 && { backgroundColor: 'rgba(0,149,255,0.18)' },
            ]}
          >
            <Text style={[styles.notifActionTxt, { color: '#FFFFFF' }]}>Ignore</Text>
          </Pressable>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(2) }}
            style={[styles.notifActionBtn, selectedIndex === 2 && { backgroundColor: 'rgba(255,59,48,0.12)' }]}
          >
            <Text style={[styles.notifActionTxt, { color: '#FF3B30' }]}>Mark as Spam</Text>
          </Pressable>
        </View>
      </LinearGradient>
    )
  }

  // ── iMessage with reply bubbles (Q3) ─────────────────────────────────────
  if (uiType === 'message') {
    return (
      <View style={styles.iMessageContainer}>
        <View style={[styles.iMessageHeader, { paddingTop: 8, paddingBottom: 12 }]}>
          <Text style={styles.iMsgBackChevron}>‹ Messages</Text>
          <View style={[styles.iMessageAvatar, { backgroundColor: '#34C759' }]}>
            <Text style={styles.iMessageAvatarText}>{initials || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.iMessageSenderName}>{sender}</Text>
            <Text style={styles.iMessageMeta}>iMessage</Text>
          </View>
        </View>
        <View style={[styles.iMessageChatArea, { justifyContent: 'flex-start' }]}>
          <View style={styles.iMessageBubbleRow}>
            <View style={[styles.iMessageAvatarSmall, { backgroundColor: '#34C759' }]}>
              <Text style={styles.iMessageAvatarSmallText}>{initials || '?'}</Text>
            </View>
            <View style={styles.iMessageBubble}>
              <Text style={styles.iMessageBubbleText}>{content}</Text>
            </View>
          </View>
          <Text style={styles.iMessageDelivered}>delivered</Text>
          <View style={styles.iMsgReplyBubbles}>
            {(options ?? []).map((opt, i) => (
              <Pressable
                key={i}
                onPress={() => { if (!anySelected) onTap?.(i) }}
                style={[
                  styles.iMsgReplyBubble,
                  selectedIndex === i && { backgroundColor: '#7C3AED' },
                  anySelected && selectedIndex !== i && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.iMsgReplyBubbleTxt}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    )
  }

  // ── Email viewer (Q4) ─────────────────────────────────────────────────────
  if (uiType === 'email') {
    return (
      <View style={styles.emailContainer}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={styles.emailPopupCard}>
            <View style={styles.emailPopupHeader}>
              <View style={[styles.emailAvatar, { backgroundColor: '#FF3B30' }]}>
                <Text style={styles.emailAvatarText}>{initials || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emailViewerSender} numberOfLines={1}>{sender}</Text>
                {preview && <Text style={styles.emailViewerSubject} numberOfLines={1}>{preview}</Text>}
              </View>
              <Text style={styles.emailViewerTime}>now</Text>
            </View>
            <View style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.08)' }} />
            <Text style={styles.emailPopupBody}>{content}</Text>
            <Text style={styles.emailPopupLink}>Verify my account →</Text>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(0) }}
              style={[
                styles.emailContinueBtn,
                { marginHorizontal: 14, marginBottom: 14 },
                selectedIndex === 0 && { backgroundColor: '#CC1500' },
                anySelected && selectedIndex !== 0 && { opacity: 0.45 },
              ]}
            >
              <Text style={styles.emailContinueTxt}>Continue →</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.emailBottomActions}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(1) }}
              style={[
                styles.emailSecondaryBtn,
                { flex: 1, borderColor: '#FF9500' },
                selectedIndex === 1 && { backgroundColor: '#FF9500' },
                anySelected && selectedIndex !== 1 && { opacity: 0.45 },
              ]}
            >
              <Text style={[styles.emailSecondaryTxt, { color: selectedIndex === 1 ? '#FFFFFF' : '#FF9500' }]}>
                Mark as Spam
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { if (!anySelected) onTap?.(2) }}
              style={[
                styles.emailSecondaryBtn,
                { flex: 1, borderColor: '#34C759' },
                selectedIndex === 2 && { backgroundColor: '#34C759' },
                anySelected && selectedIndex !== 2 && { opacity: 0.45 },
              ]}
            >
              <Text style={[styles.emailSecondaryTxt, { color: selectedIndex === 2 ? '#FFFFFF' : '#34C759' }]}>
                Report Phishing
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => { if (!anySelected) onTap?.(3) }}
            style={[{ alignItems: 'center', paddingVertical: 4 }, anySelected && selectedIndex !== 3 && { opacity: 0.45 }]}
          >
            <Text style={[styles.emailTertiaryTxt, selectedIndex === 3 && { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
              Check Sender
            </Text>
          </Pressable>
        </View>
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
    fontSize: 12,
    color: '#9A9A9A',
    textDecorationLine: 'underline',
  },

  // ── WiFi settings (light mode) ──
  wifiContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  wifiStatusBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  wifiStatusTime: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#0A0A0A',
  },
  wifiStatusRight: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#0A0A0A',
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
    color: '#0A0A0A',
    flex: 1,
    textAlign: 'center',
    marginRight: 60,
  },
  wifiList: {
    backgroundColor: '#F2F2F7',
  },
  wifiSectionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
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
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  wifiRowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
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
    color: '#0A0A0A',
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
  rewardReportBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  rewardReportTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
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
    paddingVertical: 10,
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
  iMsgReplyBubbles: {
    marginTop: 14,
    alignItems: 'flex-end',
    gap: 8,
  },
  iMsgReplyBubble: {
    backgroundColor: '#5B5CF6',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  iMsgReplyBubbleTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 19,
  },

  // ── Instagram DM (light mode) ──
  igContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  igHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
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
    color: '#0A0A0A',
  },
  igSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  igChatArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F2F2F7',
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
    backgroundColor: '#E5E5EA',
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
    color: '#0A0A0A',
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
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFFFFF',
  },
  igActionBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igActionBtnDivider: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(0,0,0,0.08)',
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
  browserPopupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  browserPopupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    width: '100%',
    alignItems: 'center',
  },
  browserPopupIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  browserPopupTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
    textAlign: 'center',
    marginBottom: 8,
  },
  browserPopupSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  browserPopupURL: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 18,
    textAlign: 'center',
  },
  browserPopupDangerBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    height: 46,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  browserPopupDangerTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  browserPopupSafeBtn: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 10,
    height: 46,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browserPopupSafeTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#007AFF',
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
  emailContainer: {
    flex: 1,
    backgroundColor: '#1C2633',
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  emailPopupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  emailPopupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emailPopupBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#4B5563',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    lineHeight: 19,
  },
  emailPopupLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#007AFF',
    paddingHorizontal: 14,
    paddingBottom: 12,
    textDecorationLine: 'underline',
  },
  emailBottomActions: {
    paddingTop: 4,
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
  emailContinueBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailContinueTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  emailSecondaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  emailSecondaryTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  emailTertiaryTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
  },

  // ── WiFi action buttons ──
  wifiActionBtns: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  wifiActionPrimary: {
    backgroundColor: '#5B5CF6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  wifiActionPrimaryTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  wifiActionSecondary: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5B5CF6',
  },
  wifiActionSecondaryTxt: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#5B5CF6',
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
