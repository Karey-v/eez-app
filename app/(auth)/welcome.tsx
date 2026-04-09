// S03–05 — Welcome Carousel
// 3 swipeable slides, dot indicators, skip button
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
  overline: string
  headline: string
  body: string
  cta?: string
}

const SLIDES: Slide[] = [
  {
    id: '1',
    overline: 'the reality',
    headline: '1 in 3 Gen Zers have been scammed online.',
    body: 'It\'s not about being gullible. Scammers are sophisticated. The question is whether your habits make you an easy target.',
  },
  {
    id: '2',
    overline: 'the truth',
    headline: 'your habits = your risk.',
    body: 'How you use passwords, who you trust, and how quickly you act online all affect how exposed you are. Most people have no idea.',
  },
  {
    id: '3',
    overline: 'find out',
    headline: 'so... how leakable are you?',
    body: 'Take a 5-minute test, get a personalised risk score, and learn exactly what to fix.',
    cta: "let's find out",
  },
]

export default function WelcomeScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleSkip() {
    router.replace('/(auth)/sign-up')
  }

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
    } else {
      router.replace('/(auth)/sign-up')
    }
  }

  function onViewableItemsChanged({ viewableItems }: any) {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0)
    }
  }

  function renderSlide({ item }: ListRenderItemInfo<Slide>) {
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH, paddingHorizontal: spacing.screenH }]}>
        <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 12 }]}>
          {item.overline}
        </Text>
        <Text style={[type.heroTitle, { color: colors.textPrimary, marginBottom: 16, lineHeight: 36 }]}>
          {item.headline}
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, lineHeight: 19 }]}>
          {item.body}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar style="dark" />

      {/* Skip button */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12, paddingHorizontal: spacing.screenH }]}>
        <View />
        <Pressable
          onPress={handleSkip}
          hitSlop={16}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text
            style={[
              type.body,
              { color: colors.textSecondary, textDecorationLine: 'underline' },
            ]}
          >
            skip
          </Text>
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
        contentContainerStyle={styles.flatListContent}
      />

      {/* Bottom: dots + CTA */}
      <View
        style={[
          styles.bottom,
          { paddingBottom: insets.bottom + 32, paddingHorizontal: spacing.screenH },
        ]}
      >
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? brand.purpleCTA : colors.borderWeak,
                  width: i === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>

        {/* CTA / Next */}
        {activeIndex === SLIDES.length - 1 ? (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: brand.purpleCTA, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.ctaText}>let's find out</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[type.body, { color: colors.textTertiary }]}>swipe or tap →</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    alignItems: 'center',
  },
  slide: {
    justifyContent: 'center',
    paddingTop: 48,
  },
  bottom: {
    alignItems: 'center',
    gap: 24,
    paddingTop: 24,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaButton: {
    borderRadius: 50,
    minHeight: 44,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  ctaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
