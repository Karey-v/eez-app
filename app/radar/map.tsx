// app/radar/map.tsx — Radar Map (stack route version)
// Same visual as the tab default. Back navigation via header arrow.
import { useState, useEffect, type ReactElement } from 'react'
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native'
import Svg, { Line as SvgLine, Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ─── SVG grid background ──────────────────────────────────────────────────────

function GridBackground() {
  const STEP = 48
  const vLines: ReactElement[] = []
  const hLines: ReactElement[] = []
  for (let x = 0; x <= SCREEN_W; x += STEP) {
    vLines.push(
      <SvgLine key={`v${x}`} x1={x} y1={0} x2={x} y2={SCREEN_H}
        stroke="rgba(255,255,255,0.045)" strokeWidth={0.5} />,
    )
  }
  for (let y = 0; y <= SCREEN_H; y += STEP) {
    hLines.push(
      <SvgLine key={`h${y}`} x1={0} y1={y} x2={SCREEN_W} y2={y}
        stroke="rgba(255,255,255,0.045)" strokeWidth={0.5} />,
    )
  }
  return (
    <Svg
      width={SCREEN_W}
      height={SCREEN_H}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {vLines}
      {hLines}
    </Svg>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Circle cx="8" cy="8" r="5" stroke={color} strokeWidth={1.5} />
      <SvgLine x1="12" y1="12" x2="15.5" y2="15.5"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}

// ─── Pins ─────────────────────────────────────────────────────────────────────

type Pin = {
  id: string
  category: string
  headline: string
  location: string
  time: string
  nx: number
  ny: number
  size: 8 | 10 | 14
}

const PINS: Pin[] = [
  {
    id: 'p1',
    category: 'Phishing',
    headline: 'fake apple support email almost got me',
    location: 'Midtown, Manhattan',
    time: '2h ago',
    nx: 0.50,
    ny: 0.28,
    size: 14,
  },
  {
    id: 'p2',
    category: 'Jobs',
    headline: 'linkedin job offer turned into a crypto trap',
    location: 'Brooklyn, NYC',
    time: '5h ago',
    nx: 0.33,
    ny: 0.60,
    size: 10,
  },
  {
    id: 'p3',
    category: 'Banks',
    headline: '"fraud team" called and emptied my account',
    location: 'Harlem, Manhattan',
    time: '1d ago',
    nx: 0.68,
    ny: 0.18,
    size: 8,
  },
  {
    id: 'p4',
    category: 'Identity',
    headline: 'my instagram got hacked after a "brand deal"',
    location: 'Queens, NYC',
    time: '3h ago',
    nx: 0.80,
    ny: 0.47,
    size: 10,
  },
]

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

function PulsingDot({
  size,
  active,
  onPress,
}: {
  size: number
  active: boolean
  onPress: () => void
}) {
  const opacity = useSharedValue(0.85)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 900 }),
        withTiming(0.85, { duration: 900 }),
      ),
      -1,
      false,
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const dotSize = active ? size + 4 : size

  return (
    <Pressable onPress={onPress} hitSlop={20}>
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: '#B1FF58',
          },
          active && styles.dotActive,
          !active && animStyle,
        ]}
      />
    </Pressable>
  )
}

// ─── Popup card ───────────────────────────────────────────────────────────────

const CARD_H = 160
const CARD_BOTTOM_OFFSET = 88

function BottomCard({
  pin,
  cardBottom,
}: {
  pin: Pin | null
  cardBottom: number
}) {
  const router = useRouter()
  const SLIDE_OFFSET = CARD_H + 60
  const translateY = useSharedValue(SLIDE_OFFSET)
  const [content, setContent] = useState<Pin | null>(null)

  useEffect(() => {
    if (pin) {
      setContent(pin)
      translateY.value = withTiming(0, { duration: 270 })
    } else {
      translateY.value = withTiming(SLIDE_OFFSET, { duration: 210 })
    }
  }, [pin])

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!content) return null

  return (
    <Animated.View style={[styles.card, { bottom: cardBottom }, cardStyle]}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardPill}>
            <Text style={[styles.cardPillText, { textTransform: 'uppercase' }]}>{content.category}</Text>
          </View>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {content.location} · {content.time}
          </Text>
        </View>
        <Text style={styles.cardHeadline} numberOfLines={2}>
          {cap(content.headline)}
        </Text>
        <Pressable
          onPress={() => router.push('/radar/feed')}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-start' })}
        >
          <Text style={styles.viewLink}>view report →</Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RadarMapScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [selected, setSelected] = useState<Pin | null>(null)

  const HEADER_H = insets.top + 56
  const MAP_H = SCREEN_H - HEADER_H
  const cardBottom = insets.bottom + CARD_BOTTOM_OFFSET

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <GridBackground />

      {/* Header — "radar." + back arrow */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>radar.</Text>
        <Pressable hitSlop={12} style={styles.searchBtn}>
          <SearchIcon color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>

      {/* Map area */}
      <Pressable style={{ flex: 1 }} onPress={() => setSelected(null)}>
        {PINS.map((pin) => {
          const half = pin.size / 2 + 2
          return (
            <View
              key={pin.id}
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                left: pin.nx * SCREEN_W - half,
                top: pin.ny * MAP_H - half,
              }}
            >
              <PulsingDot
                size={pin.size}
                active={selected?.id === pin.id}
                onPress={() => setSelected(selected?.id === pin.id ? null : pin)}
              />
            </View>
          )
        })}
      </Pressable>

      <BottomCard pin={selected} cardBottom={cardBottom} />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A2332',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: 'rgba(255,255,255,0.55)',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#FFFFFF',
  },
  searchBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  card: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: CARD_H,
    backgroundColor: '#1A2332',
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardAccent: {
    height: 2,
    backgroundColor: '#B1FF58',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#B1FF58',
  },
  cardPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1A4A00',
    letterSpacing: 0.2,
  },
  cardMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#666666',
    flex: 1,
  },
  cardHeadline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  viewLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#B1FF58',
    letterSpacing: 0.2,
  },
})
