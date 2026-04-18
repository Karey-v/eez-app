// Reusable bottom nav bar for stack screens that need the tab bar to persist
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '@/theme'
import { HomeIcon } from '@/components/icons/Home'
import { LearnIcon } from '@/components/icons/Learn'
import { RadarIcon } from '@/components/icons/Radar'
import { ProfileIcon } from '@/components/icons/Profile'

const TAB_ACTIVE_COLOR = '#5B5CF6'

export type BottomNavTab = 'home' | 'learn' | 'radar' | 'profile'

type Tab = {
  name: BottomNavTab
  label: string
  route: string
  icon: (focused: boolean) => React.ReactNode
}

const TABS: Tab[] = [
  {
    name: 'home',
    label: 'Home',
    route: '/(tabs)',
    icon: (focused) => (
      <HomeIcon size={20} color={focused ? TAB_ACTIVE_COLOR : '#9A9A9A'} filled={focused} />
    ),
  },
  {
    name: 'learn',
    label: 'Learn',
    route: '/(tabs)/learn',
    icon: (focused) => (
      <LearnIcon size={20} color={focused ? TAB_ACTIVE_COLOR : '#9A9A9A'} filled={focused} />
    ),
  },
  {
    name: 'radar',
    label: 'Radar',
    route: '/(tabs)/radar',
    icon: (focused) => (
      <RadarIcon size={20} color={focused ? TAB_ACTIVE_COLOR : '#9A9A9A'} filled={focused} />
    ),
  },
  {
    name: 'profile',
    label: 'Profile',
    route: '/(tabs)/profile',
    icon: (focused) => (
      <ProfileIcon size={20} color={focused ? TAB_ACTIVE_COLOR : '#9A9A9A'} filled={focused} />
    ),
  },
]

export function BottomNav({ activeTab }: { activeTab: BottomNavTab }) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderWeak,
        },
      ]}
    >
      {TABS.map((tab) => {
        const focused = tab.name === activeTab
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.replace(tab.route as any)}
            style={styles.tabItem}
          >
            {tab.icon(focused)}
            <Text
              style={[
                styles.label,
                {
                  color: focused ? TAB_ACTIVE_COLOR : '#9A9A9A',
                  opacity: focused ? 1 : 0.6,
                },
              ]}
            >
              {tab.label}
            </Text>
            {focused ? <View style={styles.dot} /> : <View style={styles.dotPlaceholder} />}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 2,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TAB_ACTIVE_COLOR,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
})
