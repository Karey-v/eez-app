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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        {
          borderBottomWidth: last ? 0 : 0.5,
          borderBottomColor: 'rgba(98,44,255,0.1)',
          opacity: pressed ? 0.65 : 1,
        },
      ]}
    >
      <Text style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}>
        {label}
      </Text>
      {!danger && <Text style={styles.settingsChevron}>›</Text>}
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
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24,
        }}
      >
        {/* Header */}
        <Text style={[type.heroTitle, { color: '#5B5CF6', marginBottom: 28 }]}>
          Profile.
        </Text>

        {/* Avatar + name block */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '?'}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{name.toLowerCase()}</Text>
          {band ? (
            <View style={[styles.bandBadge, { backgroundColor: bandColor ?? '#5B5CF6' }]}>
              <Text style={styles.bandBadgeText}>{band.toUpperCase()}</Text>
            </View>
          ) : (
            <Text style={[type.body, { color: colors.textTertiary, marginTop: 6, textAlign: 'center' }]}>
              Take the leakability test to get your band
            </Text>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard value={score ?? '—'} label="score" />
          <StatCard value={completedModules.length} label="modules" />
          <StatCard value={earnedBadgeIds.length} label="badges" />
          <StatCard value={streak} label="streak" />
        </View>

        {/* Badge shelf */}
        <Text
          style={[
            type.sectionHead,
            { color: colors.textPrimary, marginTop: 28, marginBottom: 14 },
          ]}
        >
          Badges
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
                    backgroundColor: earned ? badge.color : '#EEF0FF',
                    borderColor: colors.borderWeak,
                    borderWidth: earned ? 0 : 0.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 24, opacity: earned ? 1 : 0.4 }}>{badge.icon}</Text>
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
          Settings
        </Text>
        <View style={styles.settingsCard}>
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
  root: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#FFFFFF',
  },
  userName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    marginTop: 14,
  },
  bandBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  bandBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.6,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  statNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    lineHeight: 26,
    color: '#0A0A0A',
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#9A9A9A',
    marginTop: 3,
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(98,44,255,0.12)',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  settingsLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#0A0A0A',
  },
  settingsLabelDanger: {
    color: '#CC0000',
  },
  settingsChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#9A9A9A',
  },
})
