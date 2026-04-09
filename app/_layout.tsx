import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display'
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useUserStore } from '@/store/userStore'
import 'react-native-reanimated'

SplashScreen.preventAutoHideAsync()

// Handles routing based on auth state. Rendered inside the Stack so
// useSegments/useRouter have access to the navigation context.
function AuthGuard() {
  const segments = useSegments()
  const router = useRouter()
  const isSignedIn = useUserStore((s) => s.isSignedIn)

  useEffect(() => {
    const inAuth = segments[0] === '(auth)'
    if (!isSignedIn && !inAuth) {
      router.replace('/(auth)/splash')
    } else if (isSignedIn && inAuth) {
      router.replace('/(tabs)')
    }
  }, [isSignedIn, segments])

  return null
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="leakability/intro" />
        <Stack.Screen name="leakability/question" />
        <Stack.Screen name="leakability/result" />
        <Stack.Screen name="leakability/breakdown" />
        <Stack.Screen name="learn/[moduleId]/index" />
        <Stack.Screen name="learn/[moduleId]/lesson" />
        <Stack.Screen name="learn/[moduleId]/complete" />
        <Stack.Screen name="radar/incident/[id]" />
        <Stack.Screen name="radar/report" />
        <Stack.Screen name="safety/detector" />
        <Stack.Screen name="safety/chat" />
        <Stack.Screen name="safety/helplines" />
        <Stack.Screen name="safety/guide/[scenario]" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="profile/badges" />
      </Stack>
      <AuthGuard />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}
