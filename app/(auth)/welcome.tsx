// S03–05 — Welcome Carousel
// Brand purple gradient, lime headline, tap-to-advance (no swipe)
import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type Slide = {
  id: string
  headline: string
  body: string
  illustration: 'eye' | 'wifi' | 'lock'
}

const SLIDES: Slide[] = [
  {
    id: '1',
    headline: '1 in 3 young adults have been scammed online.',
    body: "It's not about being gullible. Scammers are sophisticated. The question is whether your habits make you an easy target.",
    illustration: 'eye',
  },
  {
    id: '2',
    headline: 'your habits = your risk.',
    body: 'How you use passwords, who you trust, and how quickly you act online all affect how exposed you are. Most people have no idea.',
    illustration: 'wifi',
  },
  {
    id: '3',
    headline: 'so... how leakable are you?',
    body: 'Take a 5-minute test, get a personalised risk score, and learn exactly what to fix.',
    illustration: 'lock',
  },
]

function SlideIllustration({ type }: { type: Slide['illustration'] }) {
  if (type === 'eye') {
    return (
      <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
        <Circle cx={40} cy={40} r={26} stroke="#B1FF58" strokeWidth={1.5} />
        <Circle cx={40} cy={40} r={10} stroke="#B1FF58" strokeWidth={1.5} />
      </Svg>
    )
  }
  if (type === 'wifi') {
    return (
      <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
        <Path d="M10 38 Q40 14 70 38" stroke="#B1FF58" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M19 50 Q40 30 61 50" stroke="#B1FF58" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M28 62 Q40 48 52 62" stroke="#B1FF58" strokeWidth={1.5} strokeLinecap="round" />
        <Circle cx={40} cy={70} r={3} fill="#B1FF58" />
      </Svg>
    )
  }
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Rect x={18} y={40} width={44} height={28} rx={6} stroke="#B1FF58" strokeWidth={1.5} />
      <Path
        d="M26 40V32C26 18 54 18 54 32V40"
        stroke="#B1FF58"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={40} cy={54} r={4} stroke="#B1FF58" strokeWidth={1.5} />
    </Svg>
  )
}

export default function WelcomeScreen() {
  const { spacing } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeIndex, setActiveIndex] = useState(0)

  const slide = SLIDES[activeIndex]
  const isFirst = activeIndex === 0
  const isLast = activeIndex === SLIDES.length - 1

  function handleTap() {
    if (!isLast) {
      setActiveIndex(activeIndex + 1)
    } else {
      router.replace('/(auth)/sign-up')
    }
  }

  function handleBack() {
    if (!isFirst) {
      setActiveIndex(activeIndex - 1)
    }
  }

  function handleSkip() {
    router.replace('/(auth)/sign-up')
  }

  return (
    <Pressable
      style={[styles.container, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
      onPress={handleTap}
    >
      <StatusBar style="light" />

      {/* 4-stop gradient: brand purple at top fading to near-white only at very bottom */}
      <LinearGradient
        colors={['#602CFF', '#7B4FFF', '#9B7FFF', '#C4AAFF']}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Top bar: progress lines + skip */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + 12, paddingHorizontal: spacing.screenH },
        ]}
      >
        <View style={styles.progressLines}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressLine,
                { backgroundColor: i <= activeIndex ? '#B1FF58' : 'rgba(255,255,255,0.2)' },
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={handleSkip}
          hitSlop={16}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.navText}>skip</Text>
        </Pressable>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationArea}>
        <View style={styles.verticalLine} />
        <SlideIllustration type={slide.illustration} />
      </View>

      {/* Text content */}
      <View style={[styles.slideContent, { paddingHorizontal: spacing.screenH }]}>
        <Text style={styles.headline}>{slide.headline}</Text>
        <Text style={styles.subtext}>{slide.body}</Text>
      </View>

      {/* Bottom row: back left, CTA right on last slide */}
      <View
        style={[
          styles.bottom,
          { paddingBottom: insets.bottom + 32, paddingHorizontal: spacing.screenH },
        ]}
      >
        {!isFirst ? (
          <Pressable
            onPress={handleBack}
            hitSlop={16}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.navText}>← back</Text>
          </Pressable>
        ) : (
          <View />
        )}

        {isLast && (
          <Pressable
            onPress={handleTap}
            style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.ctaText}>let's find out</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#602CFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressLines: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  navText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  illustrationArea: {
    alignItems: 'center',
    marginTop: 40,
  },
  verticalLine: {
    width: 1,
    height: 120,
    backgroundColor: '#B1FF58',
  },
  slideContent: {
    marginTop: 32,
    flex: 1,
  },
  headline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
    color: '#B1FF58',
    textAlign: 'center',
  },
  subtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 44 + 32,
  },
  ctaButton: {
    backgroundColor: '#B1FF58',
    borderRadius: 50,
    height: 56,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#1A4A00',
  },
})
