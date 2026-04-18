// Radar tab — OSM tile map, lime pulsing dots, bottom toggle pill.
import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native'
import Svg, { Line as SvgLine, Circle, Path } from 'react-native-svg'
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

// ─── OSM tile grid (4×4, zoom 14, centered on NYC) ───────────────────────────

const TILE_COLS = 4
const TILE_ROWS = 4
// Each tile fills one quarter of the screen in each axis.
const TILE_W = SCREEN_W / TILE_COLS
const TILE_H = SCREEN_H / TILE_ROWS

const TILE_URLS = [
  // row 0
  'https://tile.openstreetmap.org/14/4823/6160.png',
  'https://tile.openstreetmap.org/14/4824/6160.png',
  'https://tile.openstreetmap.org/14/4825/6160.png',
  'https://tile.openstreetmap.org/14/4826/6160.png',
  // row 1
  'https://tile.openstreetmap.org/14/4823/6161.png',
  'https://tile.openstreetmap.org/14/4824/6161.png',
  'https://tile.openstreetmap.org/14/4825/6161.png',
  'https://tile.openstreetmap.org/14/4826/6161.png',
  // row 2
  'https://tile.openstreetmap.org/14/4823/6162.png',
  'https://tile.openstreetmap.org/14/4824/6162.png',
  'https://tile.openstreetmap.org/14/4825/6162.png',
  'https://tile.openstreetmap.org/14/4826/6162.png',
  // row 3
  'https://tile.openstreetmap.org/14/4823/6163.png',
  'https://tile.openstreetmap.org/14/4824/6163.png',
  'https://tile.openstreetmap.org/14/4825/6163.png',
  'https://tile.openstreetmap.org/14/4826/6163.png',
]

const TILES = TILE_URLS.map((uri, i) => ({
  uri,
  col: i % TILE_COLS,
  row: Math.floor(i / TILE_COLS),
}))

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

function MapPinIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
      <Path
        d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="6" r="1.8" stroke={color} strokeWidth={1.2} />
    </Svg>
  )
}

function ChatBubbleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3.5 1.5 H14.5 Q16.5 1.5 16.5 3.5 V10.5 Q16.5 12.5 14.5 12.5 H7 L4 16 V12.5 H3.5 Q1.5 12.5 1.5 10.5 V3.5 Q1.5 1.5 3.5 1.5 Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
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
  nx: number  // 0–1 across screen width
  ny: number  // 0–1 across map area height
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

// ─── Pulsing dot — solid lime, no rings ───────────────────────────────────────

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

// ─── Popup card (slides up, #1A2332 bg, lime accent) ─────────────────────────

const CARD_H = 160
// Toggle pill: bottom=20 + height=56 + gap=12 → card bottom offset
const CARD_BOTTOM_OFFSET = 88  // relative to insets.bottom

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
      {/* 2px lime top accent */}
      <View style={styles.cardAccent} />

      <View style={styles.cardBody}>
        {/* Category pill + meta */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardPill}>
            <Text style={styles.cardPillText}>{content.category}</Text>
          </View>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {content.location} · {content.time}
          </Text>
        </View>

        {/* Headline */}
        <Text style={styles.cardHeadline} numberOfLines={2}>
          {content.headline}
        </Text>

        {/* Link */}
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

export default function RadarScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [selected, setSelected] = useState<Pin | null>(null)

  const HEADER_H = insets.top + 56
  const MAP_H = SCREEN_H - HEADER_H
  const cardBottom = insets.bottom + CARD_BOTTOM_OFFSET

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* OSM tile grid + dark overlay — fills full screen behind everything */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {TILES.map(({ uri, col, row }) => (
          <Image
            key={uri}
            source={{ uri }}
            style={{
              position: 'absolute',
              left: col * TILE_W,
              top: row * TILE_H,
              width: TILE_W + 1,   // +1 closes seam between tiles
              height: TILE_H + 1,
            }}
            resizeMode="cover"
          />
        ))}
        {/* Dark slate overlay — maintains brand feel over map */}
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
        />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>radar.</Text>
        <Pressable hitSlop={12} style={styles.searchBtn}>
          <SearchIcon color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>

      {/* Map area — tap to dismiss card */}
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setSelected(null)}
      >
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

      {/* Popup card */}
      <BottomCard pin={selected} cardBottom={cardBottom} />

      {/* Bottom toggle pill */}
      <View
        style={[styles.toggleContainer, { bottom: insets.bottom + 20 }]}
        pointerEvents="box-none"
      >
        <View style={styles.togglePill}>
          {/* Map — active */}
          <Pressable style={[styles.toggleOption, styles.toggleOptionActive]}>
            <MapPinIcon color="#FFFFFF" />
          </Pressable>
          {/* List — inactive */}
          <Pressable
            style={[styles.toggleOption, styles.toggleOptionInactive]}
            onPress={() => router.push('/radar/feed')}
          >
            <ChatBubbleIcon color="rgba(255,255,255,0.5)" />
          </Pressable>
        </View>
      </View>
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
    paddingBottom: 14,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#B1FF58',
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
    backgroundColor: '#1A1A1A',
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
  toggleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  toggleOption: {
    width: 56,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  toggleOptionInactive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
})
