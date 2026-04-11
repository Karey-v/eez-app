// S03–05 — Welcome Carousel
// 3 swipeable slides, per-slide backgrounds, line progress indicators, skip button
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
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

type Slide = {
  id: string
  headline: string
  body: string
  cta?: string
  bgColor: string
  textColor: string
  subTextColor: string
}

const SLIDES: Slide[] = [
  {
    id: '1',
    headline: '1 in 3 gen zers have been scammed online.',
    body: "It's not about being gullible. Scammers are sophisticated. The question is whether your habits make you an easy target.",
    bgColor: '#B1FF58',
    textColor: '#1A4A00',
    subTextColor: 'rgba(26,74,0,0.72)',
  },
  {
    id: '2',
    headline: 'your habits = your risk.',
    body: 'How you use passwords, who you trust, and how quickly you act online all affect how exposed you are. Most people have no idea.',
    bgColor: '#FFFFFF',
    textColor: '#0A0A0A',
    subTextColor: '#5A5A5A',
  },
  {
    id: '3',
    headline: 'so... how leakable are you?',
    body: 'Take a 5-minute test, get a personalised risk score, and learn exactly what to fix.',
    cta: "let's find out",
    bgColor: '#602CFF',
    textColor: '#FFFFFF',
    subTextColor: 'rgba(255,255,255,0.72)',
  },
]

export default function WelcomeScreen() {
  const { spacing } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const currentSlide = SLIDES[activeIndex]

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

  function renderSlide({ item }: ListRenderItemInfo<Slide>) {
    return (
      <View
        style={[
          styles.slide,
          { width: SCREEN_WIDTH, backgroundColor: item.bgColor, paddingHorizontal: spacing.screenH },
        ]}
      >
        <Text
          style={[
            styles.headline,
            { color: item.textColor },
          ]}
        >
          {item.headline}
        </Text>
        <Text
          style={[
            styles.subtext,
            { color: item.subTextColor },
          ]}
        >
          {item.body}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.bgColor }]}>
      <StatusBar style="dark" />

      {/* Top bar: progress lines + skip */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + 12, paddingHorizontal: spacing.screenH },
        ]}
      >
        {/* Progress lines */}
        <View style={styles.progressLines}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressLine,
                { backgroundColor: i <= activeIndex ? '#0A0A0A' : 'rgba(0,0,0,0.15)' },
              ]}
            />
          ))}
        </View>

        {/* Skip */}
        <Pressable
          onPress={handleSkip}
          hitSlop={16}
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.skipText}>skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
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
        contentContainerStyle={{ alignItems: 'stretch' }}
      />

      {/* Bottom CTA — only on last slide */}
      <View
        style={[
          styles.bottom,
          { paddingBottom: insets.bottom + 32, paddingHorizontal: spacing.screenH },
        ]}
      >
        {activeIndex === SLIDES.length - 1 && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    gap: 12,
  },
  progressLines: {
    flexDirection: 'row',
    gap: 6,
  },
  progressLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  skipBtn: {
    alignSelf: 'flex-end',
  },
  skipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#9A9A9A',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    justifyContent: 'flex-start',
    paddingTop: 48,
  },
  headline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
    marginBottom: 16,
  },
  subtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  bottom: {
    minHeight: 44 + 32,
    justifyContent: 'flex-end',
  },
  ctaButton: {
    backgroundColor: '#B1FF58',
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
    color: '#1A4A00',
  },
})
