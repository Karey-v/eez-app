import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { HomeIcon } from '@/components/icons/Home'
import { LearnIcon } from '@/components/icons/Learn'
import { RadarIcon } from '@/components/icons/Radar'
import { ProfileIcon } from '@/components/icons/Profile'

const TAB_ACTIVE_COLOR = '#5B5CF6'

export default function TabLayout() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64 + insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(98,44,255,0.15)',
          paddingBottom: insets.bottom,
          paddingTop: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: TAB_ACTIVE_COLOR,
        tabBarInactiveTintColor: '#9A9A9A',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabItem
              icon={<HomeIcon size={20} color={focused ? TAB_ACTIVE_COLOR : color} filled={focused} />}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabItem
              icon={<LearnIcon size={20} color={focused ? TAB_ACTIVE_COLOR : color} filled={focused} />}
              label="Learn"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="radar"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabItem
              icon={<RadarIcon size={20} color={focused ? TAB_ACTIVE_COLOR : color} filled={focused} />}
              label="Radar"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="detect"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="safety"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabItem
              icon={<ProfileIcon size={20} color={focused ? TAB_ACTIVE_COLOR : color} filled={focused} />}
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  )
}

function TabItem({ icon, label, focused }: { icon: React.ReactNode; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      {icon}
      <Text style={[styles.label, { color: focused ? TAB_ACTIVE_COLOR : '#9A9A9A' }]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 3,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
