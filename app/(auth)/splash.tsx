// S01 — Splash Screen
// Purple bg, EEZ logo fade-in, exactly 2s total then navigate to welcome
import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { EezLogo } from '@/components/icons/EezLogo'
import { useUserStore } from '@/store/userStore'

export default function SplashScreen() {
  const router = useRouter()
  const isSignedIn = useUserStore((s) => s.isSignedIn)
  const opacity = useRef(new Animated.Value(0)).current
  const navigated = useRef(false)

  function navigate() {
    if (navigated.current) return
    navigated.current = true
    router.replace(isSignedIn ? '/(tabs)' : '/(auth)/welcome')
  }

  useEffect(() => {
    // Fade in over 600ms, then hold until the 2s mark
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    const timer = setTimeout(navigate, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity }}>
        <EezLogo width={140} height={140} color="#B1FF58" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#602CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
