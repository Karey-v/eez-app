// Radar tab — default view is the incident map with pulsing dots.
// Chat/list icon in header navigates to the full feed (app/radar/feed.tsx).
import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native'
import Svg, { Line as SvgLine } from 'react-native-svg'
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

// ─── OSM tile grid ────────────────────────────────────────────────────────────

const COLS = 3
const BASE_X = 2047
const BASE_Y = 1356
const TILE_PX = SCREEN_W / COLS
const ROWS = Math.ceil(SCREEN_H / TILE_PX) + 2

function tileUri(x: number, y: number) {
  return `https://tile.openstreetmap.org/12/${x}/${y}.png`
}

// ─── Category → color map ────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  Phishing: '#602CFF',
  Jobs:     '#FF732E',
  Banks:    '#5B5CF6',
  Identity: '#CC0000',
  Payments: '#007549',
}

// ─── 4 fixed NYC incident pins ────────────────────────────────────────────────

type Pin = {
  id: string
  label: string
  category: string
  headline: string
  location: string
  nx: number
  ny: number
}

const PINS: Pin[] = [
  {
    id: 'p1',
    label: 'Phishing',
    category: 'Phishing',
    headline: 'fake apple support email almost got me',
    location: 'Midtown, Manhattan',
    nx: 0.50,
    ny: 0.28,
  },
  {
    id: 'p2',
    label: 'Job Scam',
    category: 'Jobs',
    headline: 'linkedin job offer turned into a crypto trap',
    location: 'Brooklyn, NYC',
    nx: 0.33,
    ny: 0.60,
  },
  {
    id: 'p3',
    label: 'Bank Fraud',
    category: 'Banks',
    headline: '"fraud team" called and emptied my account',
    location: 'Harlem, Manhattan',
    nx: 0.68,
    ny: 0.18,
  },
  {
    id: 'p4',
    label: 'ID Theft',
    category: 'Identity',
    headline: 'my instagram got hacked after a "brand deal"',
    location: 'Queens, NYC',
    nx: 0.80,
    ny: 0.47,
  },
]

// ─── List icon (feed) ─────────────────────────────────────────────────────────

function ListIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <SvgLine x1="3" y1="5" x2="15" y2="5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <SvgLine x1="3" y1="9" x2="15" y2="9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <SvgLine x1="3" y1="13" x2="15" y2="13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

function PulsingDot({
  color,
  label,
  active,
  onPress,
}: {
  color: string
  label: string
  active: boolean
  onPress: () => void
}) {
  const ringScale = useSharedValue(1)
  const ringOpacity = useSharedValue(0.8)

  useEffect(() => {
    ringScale.value = withRepeat(
      withSequence(
        withTiming(2.8, { duration: 1000 }),
        withTiming(1,   { duration: 1000 }),
      ),
      -1,
      false,
    )
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0,   { duration: 1000 }),
        withTiming(0.8, { duration: 1000 }),
      ),
      -1,
      false,
    )
  }, [])

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }))

  return (
    <View style={styles.pinStack}>
      <View style={[styles.labelChip, active && { backgroundColor: color, borderColor: color }]}>
        <Text style={[styles.labelText, active && { color: '#FFFFFF' }]}>
          {label}
        </Text>
      </View>
      <Pressable onPress={onPress} hitSlop={16} style={styles.dotPressable}>
        <Animated.View style={[styles.ring, { backgroundColor: color }, ringStyle]} />
        <View style={[styles.core, { backgroundColor: color }, active && styles.coreActive]} />
      </Pressable>
    </View>
  )
}

// ─── Compact bottom card (160px, slides up) ───────────────────────────────────

const CARD_H = 160

function BottomCard({
  pin,
  bottomInset,
}: {
  pin: Pin | null
  bottomInset: number
}) {
  const router = useRouter()
  const SLIDE_OFFSET = CARD_H + bottomInset + 32
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

  const color = CAT_COLOR[content.category] ?? '#5B5CF6'

  return (
    <Animated.View
      style={[styles.card, { paddingBottom: bottomInset + 14, borderTopColor: color }, cardStyle]}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.pill, { backgroundColor: color }]}>
          <Text style={styles.pillText}>{content.category}</Text>
        </View>
        <Text style={styles.cardLoc} numberOfLines={1}>{content.location}</Text>
      </View>
      <Text style={styles.cardHeadline} numberOfLines={2}>
        {content.headline}
      </Text>
      <Pressable
        onPress={() => router.push('/radar/feed')}
        hitSlop={10}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-start' })}
      >
        <Text style={[styles.viewLink, { color }]}>view report →</Text>
      </Pressable>
    </Animated.View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RadarScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [selected, setSelected] = useState<Pin | null>(null)

  const HEADER_H = insets.top + 56
  const MAP_H = SCREEN_H - HEADER_H

  const tiles: { key: string; uri: string; col: number; row: number }[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = BASE_X + col
      const y = BASE_Y + row
      tiles.push({ key: `${x}/${y}`, uri: tileUri(x, y), col, row })
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>incident map</Text>
        <Pressable
          onPress={() => router.push('/radar/feed')}
          hitSlop={8}
          style={styles.feedBtn}
        >
          <ListIcon color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      {/* ── Map area ── */}
      <Pressable style={styles.mapArea} onPress={() => setSelected(null)}>
        {/* OSM tile grid */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {tiles.map(({ key, uri, col, row }) => (
            <Image
              key={key}
              source={{ uri }}
              style={{
                position: 'absolute',
                left: col * TILE_PX,
                top:  row * TILE_PX,
                width:  TILE_PX + 1,
                height: TILE_PX + 1,
              }}
              resizeMode="cover"
            />
          ))}
        </View>

        {/* Dark overlay */}
        <View style={styles.overlay} pointerEvents="none" />

        {/* Pins */}
        {PINS.map((pin) => {
          const color = CAT_COLOR[pin.category]
          const CHIP_H = 22
          const CHIP_GAP = 5
          const DOT_HALF = 16
          return (
            <View
              key={pin.id}
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                left:  pin.nx * SCREEN_W - DOT_HALF,
                top:   pin.ny * MAP_H - CHIP_H - CHIP_GAP - DOT_HALF,
              }}
            >
              <PulsingDot
                color={color}
                label={pin.label}
                active={selected?.id === pin.id}
                onPress={() => setSelected(selected?.id === pin.id ? null : pin)}
              />
            </View>
          )
        })}
      </Pressable>

      {/* ── Compact slide-up card ── */}
      <BottomCard pin={selected} bottomInset={insets.bottom} />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#F5F5F5',
    letterSpacing: 0.2,
  },
  feedBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapArea: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,4,8,0.52)',
  },
  pinStack: {
    alignItems: 'center',
    gap: 5,
  },
  labelChip: {
    backgroundColor: 'rgba(10,10,10,0.72)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  labelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#E8E8E8',
    letterSpacing: 0.3,
  },
  dotPressable: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  core: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  coreActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_H + 40,
    backgroundColor: '#111114',
    borderTopWidth: 2,
    paddingTop: 14,
    paddingHorizontal: 20,
    gap: 8,
    zIndex: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardLoc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    flex: 1,
  },
  cardHeadline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#F0F0F0',
    lineHeight: 22,
  },
  viewLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.2,
  },
})
