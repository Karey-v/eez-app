// S03–05 — Welcome Carousel
// Dark entry experience, 3 slides, SVG illustrations, purple accent
import { useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
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
  cta?: string
  illustration: 'eye' | 'wifi' | 'lock'
}

const SLIDES: Slide[] = [
  {
    id: '1',
    headline: '1 in 3 gen zers have been scammed online.',
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
    cta: "let's find out",
    illustration: 'lock',
  },
]

function SlideIllustration({ type }: { type: Slide['illustration'] }) {
  if (type === 'eye') {
    return (
      <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
        <Circle cx={40} cy={40} r={26} stroke="#602CFF" strokeWidth={1.5} />
        <Circle cx={40} cy={40} r={10} stroke="#602CFF" strokeWidth={1.5} />
      </Svg>
    )
  }
  if (type === 'wifi') {
    return (
      <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
        <Path d="M10 38 Q40 14 70 38" stroke="#602CFF" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M19 50 Q40 30 61 50" stroke="#602CFF" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M28 62 Q40 48 52 62" stroke="#602CFF" strokeWidth={1.5} strokeLinecap="round" />
        <Circle cx={40} cy={70} r={3} fill="#602CFF" />
      </Svg>
    )
  }
  // lock
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Rect x={18} y={40} width={44} height={28} rx={6} stroke="#602CFF" strokeWidth={1.5} />
      <Path
        d="M26 40V32C26 18 54 18 54 32V40"
        stroke="#602CFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={40} cy={54} r={4} stroke="#602CFF" strokeWidth={1.5} />
    </Svg>
  )
}

export default function WelcomeScreen() {
  const { spacing } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleSkip() {
    router.replace('/(auth)/sign-up')
  }

  function handleCTA() {
    router.replace('/(auth)/sign-up')
  }

  function onViewableItemsChanged({ viewableItems }: any) {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0)
    }
  }

  function renderSlide({ item, index }: ListRenderItemInfo<Slide>) {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
        {/* Purple radial glow — centered behind illustration */}
        <LinearGradient
          colors={['rgba(98,44,255,0.2)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.purpleGlow}
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
                  {
                    backgroundColor:
                      i <= activeIndex ? '#602CFF' : 'rgba(255,255,255,0.2)',
                  },
                ]}
              />
            ))}
          </View>
          <Pressable
            onPress={handleSkip}
            hitSlop={16}
            style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.skipText}>skip</Text>
          </Pressable>
        </View>

        {/* Illustration area: vertical line then SVG */}
        <View style={styles.illustrationArea}>
          <View style={styles.verticalLine} />
          <SlideIllustration type={item.illustration} />
        </View>

        {/* Text content */}
        <View style={[styles.slideContent, { paddingHorizontal: spacing.screenH }]}>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.subtext}>{item.body}</Text>
        </View>

        {/* Bottom CTA — only on last slide */}
        <View
          style={[
            styles.bottom,
            { paddingBottom: insets.bottom + 32, paddingHorizontal: spacing.screenH },
          ]}
        >
          {index === SLIDES.length - 1 && (
            <Pressable
              onPress={handleCTA}
              style={({ pressed }) => [
                styles.ctaButton,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.ctaText}>let's find out</Text>
            </Pressable>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        style={styles.flatList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    backgroundColor: '#0A0A0A',
  },
  purpleGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
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
  skipBtn: {},
  skipText: {
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
    backgroundColor: '#602CFF',
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
    color: '#FFFFFF',
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
    minHeight: 44 + 32,
    justifyContent: 'flex-end',
  },
  ctaButton: {
    backgroundColor: '#602CFF',
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  ctaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
