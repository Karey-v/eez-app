import { View, Text } from 'react-native'
import { useTheme } from '@/theme'

// Phase 5 will build this screen fully (S48 Safety Home)
export default function SafetyScreen() {
  const { colors, type, spacing } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, padding: spacing.screenH, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[type.screenTitle, { color: colors.textPrimary }]}>safety</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>phase 5 — coming soon</Text>
    </View>
  )
}
