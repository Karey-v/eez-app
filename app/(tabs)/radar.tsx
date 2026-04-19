// Radar tab — OSM tile map, lime pulsing dots, bottom toggle pill.
import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native'
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
import { MapPinIcon } from '@/components/icons/MapPin'
import { ChatBubbleIcon } from '@/components/icons/ChatBubble'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')


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
  nx: number  // 0–1 across screen width
  ny: number  // 0–1 across map area height
  size: 14 | 16 | 20
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
    size: 20,
  },
  {
    id: 'p2',
    category: 'Jobs',
    headline: 'linkedin job offer turned into a crypto trap',
    location: 'Brooklyn, NYC',
    time: '5h ago',
    nx: 0.33,
    ny: 0.60,
    size: 16,
  },
  {
    id: 'p3',
    category: 'Banks',
    headline: '"fraud team" called and emptied my account',
    location: 'Harlem, Manhattan',
    time: '1d ago',
    nx: 0.68,
    ny: 0.18,
    size: 14,
  },
  {
    id: 'p4',
    category: 'Identity',
    headline: 'my instagram got hacked after a "brand deal"',
    location: 'Queens, NYC',
    time: '3h ago',
    nx: 0.80,
    ny: 0.47,
    size: 16,
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

// ─── Popup card (slides up, white bg, light mode) ────────────────────────────

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

      {/* Full-screen map + dark overlay */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Image
          source={require('../../assets/images/radar-map.png')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
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
          <Pressable style={styles.toggleOption}>
            <MapPinIcon color="#FFFFFF" size={20} />
          </Pressable>
          {/* Feed — inactive */}
          <Pressable
            style={styles.toggleOption}
            onPress={() => router.push('/radar/feed')}
          >
            <ChatBubbleIcon color="rgba(255,255,255,0.5)" size={20} />
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
    color: '#5B5CF6',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cardAccent: {
    height: 2,
    backgroundColor: '#5B5CF6',
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
    backgroundColor: '#5B5CF6',
  },
  cardPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
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
    color: '#0A0A0A',
    lineHeight: 20,
  },
  viewLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#5B5CF6',
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
    backgroundColor: '#5B5CF6',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 2,
  },
  toggleOption: {
    width: 52,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
