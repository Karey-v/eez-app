// S32 — Education Home (stub)
// Password Glow-Up unlocked, rest locked. Streak + badge shelf.
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { useLearnStore } from '@/store/learnStore'
import { modules } from '@/data/modules'
import { badges } from '@/data/badges'

export default function LearnScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { streak, badges: earnedBadgeIds } = useUserStore()
  const { completedModules } = useLearnStore()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgSecondary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Header */}
        <Text style={[type.heroTitle, { color: '#5B5CF6', marginBottom: 4 }]}>Learn.</Text>
        <Text style={[type.body, { color: colors.textSecondary, marginBottom: 20, lineHeight: 18 }]}>
          Bite-sized modules to make you harder to scam.
        </Text>

        {/* Streak chip */}
        <View style={[styles.streakRow, { backgroundColor: '#EEF0FF' }]}>
          <Text style={{ fontSize: 14 }}>🔥</Text>
          <Text style={[type.cardTitle, { color: colors.textPrimary }]}>
            {streak} day streak
          </Text>
        </View>

        {/* Module section */}
        <Text style={[type.label, { color: colors.textTertiary, marginTop: 24, marginBottom: 10 }]}>
          Your learning path
        </Text>

        {modules.map((module) => {
          const isCompleted = completedModules.includes(module.id)

          return (
            <View
              key={module.id}
              style={[
                styles.moduleCard,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: colors.borderWeak,
                  marginBottom: spacing.cardGap,
                },
              ]}
            >
              <View style={styles.moduleHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[type.label, { color: brand.purpleCTA, marginBottom: 4, textTransform: 'none' }]}>
                    {module.tag} · {module.duration}
                  </Text>
                  <Text
                    style={[
                      type.cardTitle,
                      { color: colors.textPrimary, marginBottom: 3, fontSize: 14 },
                    ]}
                  >
                    {module.title}
                  </Text>
                  <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
                    {module.difficulty} · {module.xp} XP
                  </Text>
                </View>

                {isCompleted ? (
                  <View style={[styles.donePill, { backgroundColor: '#E8FFB0' }]}>
                    <Text style={[type.label, { color: '#007549' }]}>Done ✓</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => router.push(`/learn/${module.id}`)}
                    style={({ pressed }) => [
                      styles.startBtn,
                      { backgroundColor: brand.purpleCTA, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Text style={[type.label, { color: '#FFFFFF' }]}>start</Text>
                  </Pressable>
                )}
              </View>

              {/* Completed progress fill */}
              {isCompleted && (
                <View style={[styles.progressTrack, { backgroundColor: colors.bgTertiary, marginTop: 12 }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.successText }]} />
                </View>
              )}
            </View>
          )
        })}

        {/* Badge shelf */}
        <Text style={[type.label, { color: colors.textTertiary, marginTop: 24, marginBottom: 10 }]}>
          Badges
        </Text>

        <View style={styles.badgeRow}>
          {badges.slice(0, 5).map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id)
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeCircle,
                  {
                    backgroundColor: earned ? badge.color : '#EEF0FF',
                    borderColor: earned ? badge.color : colors.borderWeak,
                  },
                ]}
              >
                <Text style={{ fontSize: earned ? 20 : 14 }}>
                  {earned ? badge.icon : '🔒'}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  moduleCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donePill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  startBtn: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
})
