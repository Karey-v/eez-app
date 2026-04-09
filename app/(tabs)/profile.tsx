// S55 — Profile Screen
// Avatar with initials, stats row, badge shelf, settings list with working log out
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useUserStore } from '@/store/userStore'
import { useLearnStore } from '@/store/learnStore'
import { badges as ALL_BADGES } from '@/data/badges'

// ─── Stat cell ────────────────────────────────────────────────────────────────

function StatCell({ value, label }: { value: string | number; label: string }) {
  const { colors, type } = useTheme()
  return (
    <View style={styles.statCell}>
      <Text style={[type.screenTitle, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[type.meta, { color: colors.textTertiary, marginTop: 2 }]}>{label}</Text>
    </View>
  )
}

// ─── Settings row ─────────────────────────────────────────────────────────────

function SettingsRow({
  label,
  onPress,
  danger,
  last,
}: {
  label: string
  onPress: () => void
  danger?: boolean
  last?: boolean
}) {
  const { colors, type } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        {
          borderBottomWidth: last ? 0 : 0.5,
          borderBottomColor: colors.borderWeak,
          opacity: pressed ? 0.65 : 1,
        },
      ]}
    >
      <Text
        style={[
          type.body,
          { color: danger ? '#CC0000' : colors.textPrimary, fontSize: 13 },
        ]}
      >
        {label}
      </Text>
      {!danger && (
        <Text style={[type.body, { color: colors.textTertiary, fontSize: 16 }]}>›</Text>
      )}
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const { name, score, band, bandColor, badges: earnedBadgeIds, streak, signOut } =
    useUserStore()
  const { completedModules } = useLearnStore()

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')

  function handleSignOut() {
    Alert.alert('log out?', "you'll need to sign back in.", [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'log out',
        style: 'destructive',
        onPress: () => {
          signOut()
          router.replace('/(auth)/splash')
        },
      },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Header */}
        <Text style={[type.heroTitle, { color: colors.textPrimary, marginBottom: 28 }]}>
          profile.
        </Text>

        {/* Avatar + name block */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: brand.purpleCTA }]}>
            <Text style={styles.avatarText}>{initials || '?'}</Text>
          </View>
          <Text style={[type.screenTitle, { color: colors.textPrimary, marginTop: 14 }]}>
            {name.toLowerCase()}
          </Text>
          {band ? (
            <View
              style={[styles.bandChip, { backgroundColor: bandColor ?? brand.purpleCTA }]}
            >
              <Text style={[type.meta, { color: '#FFFFFF' }]}>{band.toLowerCase()}</Text>
            </View>
          ) : (
            <Text style={[type.body, { color: colors.textTertiary, marginTop: 6, textAlign: 'center' }]}>
              take the leakability test to get your band
            </Text>
          )}
        </View>

        {/* Stats row */}
        <View
          style={[
            styles.statsRow,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderWeak },
          ]}
        >
          <StatCell value={score ?? '—'} label="score" />
          <View style={[styles.statDivider, { backgroundColor: colors.borderWeak }]} />
          <StatCell value={completedModules.length} label="modules" />
          <View style={[styles.statDivider, { backgroundColor: colors.borderWeak }]} />
          <StatCell value={earnedBadgeIds.length} label="badges" />
          <View style={[styles.statDivider, { backgroundColor: colors.borderWeak }]} />
          <StatCell value={streak} label="streak" />
        </View>

        {/* Badge shelf */}
        <Text
          style={[
            type.sectionHead,
            { color: colors.textPrimary, marginTop: 28, marginBottom: 14 },
          ]}
        >
          badges
        </Text>
        <View style={styles.badgeShelf}>
          {ALL_BADGES.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id)
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  {
                    backgroundColor: earned ? badge.color : colors.bgSecondary,
                    borderColor: colors.borderWeak,
                    borderWidth: earned ? 0 : 0.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 24, opacity: earned ? 1 : 0.3 }}>{badge.icon}</Text>
                <Text
                  style={[
                    type.meta,
                    {
                      color: earned ? '#FFFFFF' : colors.textTertiary,
                      marginTop: 6,
                      textAlign: 'center',
                    },
                  ]}
                  numberOfLines={2}
                >
                  {badge.name}
                </Text>
              </View>
            )
          })}
        </View>
        <Pressable
          onPress={() => router.push('/profile/badges')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            marginTop: 12,
            alignSelf: 'flex-start',
          })}
        >
          <Text style={[type.label, { color: brand.purpleCTA }]}>view all badges →</Text>
        </Pressable>

        {/* Settings */}
        <Text
          style={[
            type.sectionHead,
            { color: colors.textPrimary, marginTop: 28, marginBottom: 10 },
          ]}
        >
          settings
        </Text>
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.bgSecondary, borderColor: colors.borderWeak },
          ]}
        >
          <SettingsRow
            label="all my badges"
            onPress={() => router.push('/profile/badges')}
          />
          <SettingsRow
            label="notifications"
            onPress={() => router.push('/notifications')}
          />
          <SettingsRow label="help & support" onPress={() => {}} />
          <SettingsRow label="log out" onPress={handleSignOut} danger last />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 30,
    color: '#FFFFFF',
  },
  bandChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 0.5,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 0.5,
    height: 32,
  },
  badgeShelf: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeItem: {
    width: '30%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  settingsCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 44,
  },
})
