// S01 — Splash Screen
// Purple bg, EEZ logo centered, tap anywhere to continue to sign-up
import { useRef, useEffect } from 'react'
import { View, Pressable, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { EezLogo } from '@/components/icons/EezLogo'
import { useUserStore } from '@/store/userStore'

export default function SplashScreen() {
  const router = useRouter()
  const isSignedIn = useUserStore((s) => s.isSignedIn)
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  function handleTap() {
    router.replace(isSignedIn ? '/(tabs)' : '/(auth)/sign-up')
  }

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity }}>
        <EezLogo width={140} height={140} color="#B1FF58" />
      </Animated.View>
    </Pressable>
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
