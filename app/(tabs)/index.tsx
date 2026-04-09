import { View, Text } from 'react-native'
import { useTheme } from '@/theme'

// Phase 2 will build this screen fully (S10/S11 Home)
export default function HomeScreen() {
  const { colors, type, spacing } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, padding: spacing.screenH, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[type.screenTitle, { color: colors.textPrimary }]}>home</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>phase 2 — coming soon</Text>
    </View>
  )
}
