// Profile — All Badges screen
// Shows every badge (earned + locked), accessible from profile settings
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { badges } from '@/data/badges'

export default function BadgesScreen() {
  const { colors, type, spacing } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const earnedBadgeIds = useUserStore((s) => s.badges)

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginBottom: 20 })}
          hitSlop={12}
        >
          <Text style={[type.label, { color: colors.textTertiary }]}>← back</Text>
        </Pressable>

        {/* Header */}
        <Text style={[type.heroTitle, { color: colors.textPrimary }]}>badges.</Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: 4, marginBottom: 24 }]}>
          {earnedBadgeIds.length} of {badges.length} earned
        </Text>

        {/* Badge list */}
        {badges.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id)
          return (
            <View
              key={badge.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: earned ? badge.color : colors.borderWeak,
                  borderLeftWidth: earned ? 3 : 0.5,
                  borderWidth: 0.5,
                },
              ]}
            >
              <Text style={{ fontSize: 28, opacity: earned ? 1 : 0.25 }}>{badge.icon}</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text
                  style={[
                    type.cardTitle,
                    { color: earned ? colors.textPrimary : colors.textTertiary },
                  ]}
                >
                  {badge.name}
                </Text>
                <Text
                  style={[type.body, { color: colors.textSecondary, marginTop: 3, lineHeight: 16 }]}
                >
                  {badge.description}
                </Text>
              </View>
              {earned ? (
                <View style={[styles.earnedTag, { backgroundColor: badge.color }]}>
                  <Text style={[type.meta, { color: '#FFFFFF' }]}>earned</Text>
                </View>
              ) : (
                <View style={[styles.lockedTag, { backgroundColor: colors.bgTertiary }]}>
                  <Text style={[type.meta, { color: colors.textTertiary }]}>locked</Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  earnedTag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  lockedTag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
})
