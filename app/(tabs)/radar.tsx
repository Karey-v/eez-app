import { View, Text } from 'react-native'
import { useTheme } from '@/theme'

// Phase 6 will build this screen fully (S42 Radar Feed)
export default function RadarScreen() {
  const { colors, type, spacing } = useTheme()
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, padding: spacing.screenH, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[type.screenTitle, { color: colors.textPrimary }]}>radar</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>phase 6 — coming soon</Text>
    </View>
  )
}
