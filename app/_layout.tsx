import { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Stack, useRouter, useSegments, usePathname } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display'
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUserStore } from '@/store/userStore'
import 'react-native-reanimated'

SplashScreen.preventAutoHideAsync()

// Floating SOS button — only shown on tab screens, not stack screens.
function SOSButton() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isSignedIn = useUserStore((s) => s.isSignedIn)
  const pathname = usePathname()

  if (!isSignedIn || pathname !== '/') return null

  return (
    <Pressable
      onPress={() => router.push('/safety-modal')}
      style={({ pressed }) => [
        sosStyles.btn,
        {
          bottom: insets.bottom + 56 + 16,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={sosStyles.label}>SOS</Text>
    </Pressable>
  )
}

const sosStyles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF732E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
})

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
        <Stack.Screen name="safety-modal" />
        <Stack.Screen name="safety/coming-soon" />
        <Stack.Screen name="radar/feed" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="profile/badges" />
      </Stack>
      <AuthGuard />
      <SOSButton />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}
