import { View, Text } from 'react-native'
import { useTheme } from '@/theme'

// Phase 4 will build this screen fully (S32 Education Home)
export default function LearnScreen() {
  const { colors, type, spacing } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, padding: spacing.screenH, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[type.screenTitle, { color: colors.textPrimary }]}>learn</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>phase 4 — coming soon</Text>
    </View>
  )
}
