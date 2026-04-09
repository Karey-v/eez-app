// Notifications — Phase 4 stub
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'

export default function NotificationsScreen() {
  const { colors, type, spacing } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingTop: insets.top + 24,
        paddingHorizontal: spacing.screenH,
      }}
    >
      <Text style={[type.heroTitle, { color: colors.textPrimary }]}>notifications.</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>
        coming soon.
      </Text>
    </View>
  )
}
