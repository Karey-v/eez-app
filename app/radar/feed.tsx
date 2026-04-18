// Radar Feed — incident list with filters, upvotes, report FAB, bottom toggle pill.
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
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

// ─── Icons ────────────────────────────────────────────────────────────────────

function MapPinIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
      <Path
        d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path
        d="M8 4.2 m-1.8 1.8 a1.8 1.8 0 1 0 3.6 0 a1.8 1.8 0 1 0 -3.6 0"
        stroke={color}
        strokeWidth={1.2}
      />
    </Svg>
  )
}

function ChatBubbleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3.5 1.5 H14.5 Q16.5 1.5 16.5 3.5 V10.5 Q16.5 12.5 14.5 12.5 H7 L4 16 V12.5 H3.5 Q1.5 12.5 1.5 10.5 V3.5 Q1.5 1.5 3.5 1.5 Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// ─── Blinking live dot ────────────────────────────────────────────────────────

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
  const bg = avoided ? '#B8F04A' : (CATEGORY_COLORS[category] ?? '#5B5CF6')
  const color = avoided ? '#1A4A00' : '#FFFFFF'
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{avoided ? 'avoided' : category}</Text>
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.tagRow}>
        <CategoryTag category={card.category} avoided={card.variant === 'avoided'} />
        {card.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ verified</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardHeadline} numberOfLines={2}>
        {card.headline}
      </Text>

      <Text style={styles.cardMeta}>
        {card.location.toUpperCase()} · {card.timestamp.toUpperCase()}
      </Text>

      <Text style={styles.cardPreview} numberOfLines={3}>
        {card.preview}
      </Text>

      <View style={styles.engagementRow}>
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); onUpvote() }}
          hitSlop={8}
          style={styles.engagementItem}
        >
          <Text style={[styles.engagementText, upvoted && styles.engagementActive]}>
            ▲ {card.upvotes + (upvoted ? 1 : 0)}
          </Text>
        </Pressable>
        <View style={styles.engagementItem}>
          <Text style={styles.engagementText}>💬 {card.comments}</Text>
        </View>
        <View style={styles.engagementItem}>
          <Text style={styles.engagementText}>👁 seen this</Text>
        </View>
      </View>
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RadarFeedScreen() {
  const { brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const { feed, upvoted, toggleUpvote, reportToast, setReportToast } = useRadarStore()
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (reportToast) {
      setToastVisible(true)
      setReportToast(false)
    }
  }, [reportToast])

  const filteredFeed =
    activeFilter === 'All' ? feed : feed.filter((c) => c.category === activeFilter)

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24,
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerTitle}>radar.</Text>
            <BlinkDot />
          </View>
        </View>

        {/* Search bar (visual only) */}
        <View style={styles.searchBar}>
          <Text style={styles.searchPlaceholder}>search incidents…</Text>
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
                activeFilter === f && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f && styles.filterChipTextActive,
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
            <Text style={styles.emptyText}>no reports in this category yet.</Text>
          </View>
        ) : (
          filteredFeed.map((card) => (
            <View key={card.id} style={styles.cardGap}>
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

      {/* FAB — report */}
      <Pressable
        onPress={() => router.push('/radar/report')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: brand.purpleCTA, bottom: insets.bottom + 90, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.fabText}>report something? →</Text>
      </Pressable>

      {/* Bottom toggle pill — list active, map inactive */}
      <View
        style={[styles.toggleContainer, { bottom: insets.bottom + 20 }]}
        pointerEvents="box-none"
      >
        <View style={styles.togglePill}>
          {/* Map — inactive */}
          <Pressable
            style={[styles.toggleOption, styles.toggleOptionInactive]}
            onPress={() => router.replace('/(tabs)/radar')}
          >
            <MapPinIcon color="#999999" />
          </Pressable>
          {/* List — active */}
          <Pressable style={[styles.toggleOption, styles.toggleOptionActive]}>
            <ChatBubbleIcon color="#0A0A0A" />
          </Pressable>
        </View>
      </View>

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#B1FF58',
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
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#EBEBEB',
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#9A9A9A',
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
    backgroundColor: '#EBEBEB',
  },
  filterChipActive: {
    backgroundColor: '#0A0A0A',
  },
  filterChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#5A5A5A',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  // ── Incident card ──
  cardGap: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  verifiedBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F0F0F0',
  },
  verifiedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#007549',
  },
  cardHeadline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 20,
    color: '#0A0A0A',
    marginBottom: 5,
  },
  cardMeta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.4,
    color: '#9A9A9A',
    marginBottom: 8,
  },
  cardPreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#5A5A5A',
    marginBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 16,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#9A9A9A',
  },
  engagementActive: {
    color: '#5B5CF6',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#9A9A9A',
  },
  // ── FAB ──
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  fabText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  // ── Toggle pill ──
  toggleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  toggleOption: {
    width: 56,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
  },
  toggleOptionInactive: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
})
