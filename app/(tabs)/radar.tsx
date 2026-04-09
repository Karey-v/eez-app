// S42 — Radar Feed
// Blinking dot, search bar (visual), filter chips, 8 incident cards, FAB → report
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useRadarStore } from '@/store/radarStore'
import { Toast } from '@/components/ui/Toast'
import type { IncidentCard } from '@/data/radarFeed'

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Banks', 'Jobs', 'Payments', 'Identity', 'Phishing'] as const

const CATEGORY_COLORS: Record<string, string> = {
  Banks: '#5B5CF6',
  Jobs: '#FF732E',
  Payments: '#007549',
  Identity: '#CC0000',
  Phishing: '#602CFF',
}

// ─── Blinking dot ─────────────────────────────────────────────────────────────

function BlinkDot() {
  const opacity = useSharedValue(1)
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false,
    )
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return <Animated.View style={[styles.blinkDot, style]} />
}

// ─── Category tag ─────────────────────────────────────────────────────────────

function CategoryTag({ category, avoided }: { category: string; avoided: boolean }) {
  const { type } = useTheme()
  const bg = avoided ? '#B8F04A' : (CATEGORY_COLORS[category] ?? '#5B5CF6')
  const color = avoided ? '#1A4A00' : '#FFFFFF'
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[type.meta, { color }]}>{avoided ? 'avoided' : category}</Text>
    </View>
  )
}

// ─── Incident card ────────────────────────────────────────────────────────────

function IncidentCardView({
  card,
  upvoted,
  onPress,
  onUpvote,
}: {
  card: IncidentCard
  upvoted: boolean
  onPress: () => void
  onUpvote: () => void
}) {
  const { colors, type } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {/* Tag row */}
      <View style={styles.tagRow}>
        <CategoryTag category={card.category} avoided={card.variant === 'avoided'} />
        {card.verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.meta, { color: colors.successText }]}>✓ verified</Text>
          </View>
        )}
      </View>

      {/* Headline */}
      <Text style={[type.cardTitle, { color: colors.textPrimary, marginTop: 8, lineHeight: 18 }]}>
        {card.headline}
      </Text>

      {/* Location + time */}
      <Text style={[type.meta, { color: colors.textTertiary, marginTop: 4 }]}>
        {card.location} · {card.timestamp}
      </Text>

      {/* Preview */}
      <Text
        style={[type.body, { color: colors.textSecondary, marginTop: 8, lineHeight: 18 }]}
        numberOfLines={3}
      >
        {card.preview}
      </Text>

      {/* Engagement row */}
      <View style={styles.engagementRow}>
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); onUpvote() }}
          hitSlop={8}
          style={styles.engagementItem}
        >
          <Text style={[type.meta, { color: upvoted ? '#5B5CF6' : colors.textTertiary }]}>
            ▲ {card.upvotes + (upvoted ? 1 : 0)}
          </Text>
        </Pressable>
        <View style={styles.engagementItem}>
          <Text style={[type.meta, { color: colors.textTertiary }]}>💬 {card.comments}</Text>
        </View>
        <View style={styles.engagementItem}>
          <Text style={[type.meta, { color: colors.textTertiary }]}>👁 seen this</Text>
        </View>
      </View>
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RadarScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const { feed, upvoted, toggleUpvote, reportToast, setReportToast } = useRadarStore()
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [toastVisible, setToastVisible] = useState(false)

  // Show toast if a report was just submitted
  useEffect(() => {
    if (reportToast) {
      setToastVisible(true)
      setReportToast(false)
    }
  }, [reportToast])

  const filteredFeed =
    activeFilter === 'All' ? feed : feed.filter((c) => c.category === activeFilter)

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[type.heroTitle, { color: colors.textPrimary }]}>radar.</Text>
          <BlinkDot />
        </View>

        {/* Search bar (visual only) */}
        <View style={[styles.searchBar, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[type.body, { color: colors.textTertiary }]}>search incidents…</Text>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f ? brand.purpleCTA : colors.bgSecondary,
                },
              ]}
            >
              <Text
                style={[
                  type.label,
                  { color: activeFilter === f ? '#FFFFFF' : colors.textTertiary },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Feed */}
        {filteredFeed.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Text style={[type.body, { color: colors.textTertiary }]}>no reports in this category yet.</Text>
          </View>
        ) : (
          filteredFeed.map((card) => (
            <View key={card.id} style={{ marginBottom: spacing.cardGap }}>
              <IncidentCardView
                card={card}
                upvoted={upvoted.includes(card.id)}
                onPress={() => router.push(`/radar/incident/${card.id}`)}
                onUpvote={() => toggleUpvote(card.id)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/radar/report')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: brand.purpleCTA, bottom: insets.bottom + 56 + 16, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[type.cardTitle, { color: '#FFFFFF' }]}>report something? →</Text>
      </Pressable>

      {/* Toast */}
      <Toast
        message="your report is live on radar."
        type="confirm"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  blinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5B5CF6',
    marginTop: 4,
  },
  searchBar: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  filterRow: {
    gap: 8,
    paddingRight: 4,
    marginBottom: 16,
  },
  filterChip: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 14,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: 'transparent',
  },
})
