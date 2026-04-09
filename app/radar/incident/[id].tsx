// S44 — Incident Detail
// Full card: category tag, verified badge, description, red flags, tactic, engagement, 2 related
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useRadarStore } from '@/store/radarStore'
import { ArrowIcon } from '@/components/icons/Arrow'
import type { IncidentCard } from '@/data/radarFeed'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Banks: '#5B5CF6',
  Jobs: '#FF732E',
  Payments: '#007549',
  Identity: '#CC0000',
  Phishing: '#602CFF',
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

// ─── Compact related card ─────────────────────────────────────────────────────

function RelatedCard({ card, onPress }: { card: IncidentCard; onPress: () => void }) {
  const { colors, type } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.relatedCard,
        { backgroundColor: colors.bgPrimary, borderColor: colors.borderWeak, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <CategoryTag category={card.category} avoided={card.variant === 'avoided'} />
      <Text style={[type.cardTitle, { color: colors.textPrimary, marginTop: 8, lineHeight: 18 }]}>
        {card.headline}
      </Text>
      <Text style={[type.meta, { color: colors.textTertiary, marginTop: 4 }]}>
        {card.location} · {card.timestamp}
      </Text>
      <Text
        style={[type.body, { color: colors.textSecondary, marginTop: 6, lineHeight: 18 }]}
        numberOfLines={2}
      >
        {card.preview}
      </Text>
      <Text style={[type.meta, { color: colors.textTertiary, marginTop: 8 }]}>
        ▲ {card.upvotes}  💬 {card.comments}
      </Text>
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function IncidentDetailScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { feed, upvoted, toggleUpvote } = useRadarStore()

  const card = feed.find((c) => c.id === id)
  const isUpvoted = upvoted.includes(id)

  if (!card) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[type.body, { color: colors.textSecondary }]}>Incident not found.</Text>
      </View>
    )
  }

  // 2 related cards: same category first, then any, excluding current
  const related = [
    ...feed.filter((c) => c.id !== id && c.category === card.category),
    ...feed.filter((c) => c.id !== id && c.category !== card.category),
  ].slice(0, 2)

  const tagBg = CATEGORY_COLORS[card.category] ?? '#5B5CF6'

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>

        {/* Tag + verified */}
        <View style={styles.tagRow}>
          <CategoryTag category={card.category} avoided={card.variant === 'avoided'} />
          {card.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.successBg }]}>
              <Text style={[type.meta, { color: colors.successText }]}>✓ verified</Text>
            </View>
          )}
        </View>

        {/* Headline */}
        <Text
          style={[type.heroTitle, { color: colors.textPrimary, marginTop: 14, marginBottom: 6, lineHeight: 34 }]}
        >
          {card.headline}
        </Text>

        {/* Meta */}
        <Text style={[type.meta, { color: colors.textTertiary, marginBottom: 16 }]}>
          {card.location} · {card.timestamp}
        </Text>

        {/* Full description */}
        <Text style={[type.body, { color: colors.textSecondary, lineHeight: 20, marginBottom: 20 }]}>
          {card.preview}
        </Text>

        {/* Red flags */}
        {card.redFlags && card.redFlags.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.dangerBg }]}>
            <Text style={[type.label, { color: colors.dangerText, marginBottom: 10 }]}>
              red flags
            </Text>
            {card.redFlags.map((flag, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: colors.dangerText }]} />
                <Text style={[type.body, { color: colors.dangerText, flex: 1, lineHeight: 18 }]}>
                  {flag}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tactic */}
        {card.tactic && (
          <View style={[styles.tacticRow, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[type.label, { color: colors.textTertiary, marginBottom: 4 }]}>tactic used</Text>
            <Text style={[type.cardTitle, { color: colors.textPrimary }]}>{card.tactic}</Text>
          </View>
        )}

        {/* Engagement */}
        <View style={[styles.engagementCard, { backgroundColor: colors.bgSecondary }]}>
          <Pressable
            onPress={() => toggleUpvote(card.id)}
            style={styles.engagementBtn}
            hitSlop={8}
          >
            <Text
              style={[
                type.label,
                { color: isUpvoted ? brand.purpleCTA : colors.textSecondary },
              ]}
            >
              ▲ {card.upvotes + (isUpvoted ? 1 : 0)} {isUpvoted ? '· upvoted' : '· upvote'}
            </Text>
          </Pressable>
          <View style={[styles.engagementDivider, { backgroundColor: colors.borderWeak }]} />
          <Text style={[type.label, { color: colors.textTertiary }]}>💬 {card.comments} comments</Text>
          <View style={[styles.engagementDivider, { backgroundColor: colors.borderWeak }]} />
          <Text style={[type.label, { color: colors.textTertiary }]}>👁 seen this</Text>
        </View>

        {/* Related */}
        {related.length > 0 && (
          <>
            <Text
              style={[type.label, { color: colors.textTertiary, marginTop: 28, marginBottom: 10 }]}
            >
              related incidents
            </Text>
            {related.map((rel) => (
              <View key={rel.id} style={{ marginBottom: 6 }}>
                <RelatedCard
                  card={rel}
                  onPress={() => router.push(`/radar/incident/${rel.id}`)}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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
  section: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  tacticRow: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  engagementCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  engagementBtn: {},
  engagementDivider: {
    width: 1,
    height: 12,
  },
  relatedCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
})
