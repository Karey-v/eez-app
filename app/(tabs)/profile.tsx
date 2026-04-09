import { View, Text } from 'react-native'
import { useTheme } from '@/theme'

// Phase 7 will build this screen fully (S55 Profile)
export default function ProfileScreen() {
  const { colors, type, spacing } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, padding: spacing.screenH, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[type.screenTitle, { color: colors.textPrimary }]}>profile</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>phase 7 — coming soon</Text>
    </View>
  )
}
