// Radar Feed — incident list with filter sheet, report link, upvotes, FAB, bottom toggle pill.
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native'
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
import { BottomNav } from '@/components/ui/BottomNav'
import { MapPinIcon } from '@/components/icons/MapPin'
import { ChatBubbleIcon } from '@/components/icons/ChatBubble'
import type { IncidentCard } from '@/data/radarFeed'

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCAM_TYPES = ['All', 'Banks', 'Jobs', 'Payments', 'Identity', 'Phishing'] as const
const DISTANCES = ['Nearby', '5 km', '10 km', 'Anywhere'] as const
const OCCURRENCES = ['Recent', 'Trending', 'Most reported'] as const

const CATEGORY_COLORS: Record<string, string> = {
  Banks: '#5B5CF6',
  Jobs: '#FF732E',
  Payments: '#007549',
  Identity: '#CC0000',
  Phishing: '#602CFF',
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
      <Text style={[styles.tagText, { color, textTransform: 'uppercase' }]}>{avoided ? 'Avoided' : category}</Text>
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
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardHeadline} numberOfLines={2}>
        {cap(card.headline)}
      </Text>

      <Text style={styles.cardMeta}>
        {card.location} · {card.timestamp}
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
          <Text style={styles.engagementText}>👁 Seen this</Text>
        </View>
      </View>
    </Pressable>
  )
}

// ─── Filter sheet ─────────────────────────────────────────────────────────────

function FilterSheet({
  visible,
  onClose,
  scamType,
  setScamType,
  distance,
  setDistance,
  occurrence,
  setOccurrence,
}: {
  visible: boolean
  onClose: () => void
  scamType: string
  setScamType: (v: string) => void
  distance: string
  setDistance: (v: string) => void
  occurrence: string
  setOccurrence: (v: string) => void
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filter</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.sheetDone}>Done</Text>
          </Pressable>
        </View>

        <Text style={styles.sheetSectionLabel}>Distance</Text>
        <View style={styles.sheetChipRow}>
          {DISTANCES.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDistance(d)}
              style={[styles.sheetChip, distance === d && styles.sheetChipActive]}
            >
              <Text style={[styles.sheetChipText, distance === d && styles.sheetChipTextActive]}>
                {d}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sheetSectionLabel}>Scam type</Text>
        <View style={styles.sheetChipRow}>
          {SCAM_TYPES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setScamType(s)}
              style={[styles.sheetChip, scamType === s && styles.sheetChipActive]}
            >
              <Text style={[styles.sheetChipText, scamType === s && styles.sheetChipTextActive]}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sheetSectionLabel}>Occurrence</Text>
        <View style={styles.sheetChipRow}>
          {OCCURRENCES.map((o) => (
            <Pressable
              key={o}
              onPress={() => setOccurrence(o)}
              style={[styles.sheetChip, occurrence === o && styles.sheetChipActive]}
            >
              <Text style={[styles.sheetChipText, occurrence === o && styles.sheetChipTextActive]}>
                {o}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RadarFeedScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const { feed, upvoted, toggleUpvote, reportToast, setReportToast } = useRadarStore()
  const [scamType, setScamType] = useState('All')
  const [distance, setDistance] = useState('Anywhere')
  const [occurrence, setOccurrence] = useState('Recent')
  const [filterSheet, setFilterSheet] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (reportToast) {
      setToastVisible(true)
      setReportToast(false)
    }
  }, [reportToast])

  const filteredFeed =
    scamType === 'All' ? feed : feed.filter((c) => c.category === scamType)

  const BOTTOM_NAV_H = 56 + insets.bottom

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Sticky header — title, search, report link, filter */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerTitle}>Radar.</Text>
            <BlinkDot />
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchPlaceholder}>Search incidents…</Text>
          </View>
          <Pressable
            onPress={() => setFilterSheet(true)}
            style={({ pressed }) => [styles.filterBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.filterBtnText}>filter</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/radar/report')}
          hitSlop={8}
          style={({ pressed }) => [styles.reportLink, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.reportLinkText}>+ report incident</Text>
        </Pressable>
      </View>

      {/* Scrollable feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: BOTTOM_NAV_H + 24,
          paddingHorizontal: 24,
        }}
      >
        {filteredFeed.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Text style={styles.emptyText}>No reports in this category yet.</Text>
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

      {/* Map/Feed toggle — bottom center above BottomNav */}
      <View style={[styles.toggleContainer, { bottom: BOTTOM_NAV_H + 24 }]} pointerEvents="box-none">
        <View style={styles.togglePill}>
          <Pressable
            style={styles.toggleOption}
            hitSlop={8}
            onPress={() => router.replace('/(tabs)/radar')}
          >
            <MapPinIcon color="rgba(255,255,255,0.5)" size={18} />
          </Pressable>
          <View style={[styles.toggleOption, styles.toggleActive]}>
            <ChatBubbleIcon color="#FFFFFF" size={18} />
          </View>
        </View>
      </View>

      <BottomNav activeTab="radar" />

      <Toast
        message="your report is live on radar."
        type="confirm"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <FilterSheet
        visible={filterSheet}
        onClose={() => setFilterSheet(false)}
        scamType={scamType}
        setScamType={setScamType}
        distance={distance}
        setDistance={setDistance}
        occurrence={occurrence}
        setOccurrence={setOccurrence}
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
    backgroundColor: '#5B5CF6',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 2,
  },
  toggleOption: {
    width: 52,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // ── Sticky header ──
  stickyHeader: {
    backgroundColor: '#F8F7FF',
    paddingHorizontal: 24,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#5B5CF6',
  },
  blinkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5B5CF6',
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EBEBEB',
  },
  searchPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#9A9A9A',
  },
  filterBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0A0A0A',
  },
  filterBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  reportLink: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  reportLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#5B5CF6',
    textDecorationLine: 'underline',
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
  // ── Filter sheet ──
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
  },
  sheetDone: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#5B5CF6',
  },
  sheetSectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#9A9A9A',
    marginBottom: 10,
  },
  sheetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sheetChip: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#F0F0F0',
  },
  sheetChipActive: {
    backgroundColor: '#0A0A0A',
  },
  sheetChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#5A5A5A',
  },
  sheetChipTextActive: {
    color: '#FFFFFF',
  },
})
