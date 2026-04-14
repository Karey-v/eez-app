// S01 — Splash Screen
// Purple bg, EEZ logo centered, fade in 400ms → hold 1s → fade out 300ms → navigate
// Tappable — user can skip immediately. Auto-advance still fires.
// On web: skip animation entirely and navigate on next tick.
import { useEffect, useRef } from 'react'
import { Platform, View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { EezLogo } from '@/components/icons/EezLogo'
import { useUserStore } from '@/store/userStore'
import { brand } from '@/theme/colors'

export default function SplashScreen() {
  const router = useRouter()
  const isSignedIn = useUserStore((s) => s.isSignedIn)
  const opacity = useSharedValue(0)
  const navigated = useRef(false)

  function navigate() {
    if (navigated.current) return
    navigated.current = true
    if (isSignedIn) {
      router.replace('/(tabs)')
    } else {
      router.replace('/(auth)/welcome')
    }
  }

  useEffect(() => {
    if (Platform.OS === 'web') {
      const id = setTimeout(navigate, 0)
      return () => clearTimeout(id)
    }

    // Fade in 400ms → hold 1000ms → fade out 300ms → navigate
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withDelay(1000, withTiming(0, { duration: 300 }, () => runOnJS(navigate)()))
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Pressable style={styles.container} onPress={navigate}>
      <StatusBar style="light" />
      <Animated.View style={[styles.content, animatedStyle]}>
        <EezLogo width={140} height={140} color="#B1FF58" />
      </Animated.View>
      <Text style={styles.tapHint}>tap to continue</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: 48,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
  },
})
