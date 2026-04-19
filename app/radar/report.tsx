// S51b — Report Fraud Form
// Incident type dropdown, description textarea (280 chars), location, consent checkbox
// Submit: active when type + 20+ chars + consent. Prepends to radarStore → toast on radar.
import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { useRadarStore } from '@/store/radarStore'
import { ArrowIcon } from '@/components/icons/Arrow'
import { BottomNav } from '@/components/ui/BottomNav'
import type { IncidentCard } from '@/data/radarFeed'

// ─── Constants ────────────────────────────────────────────────────────────────

const INCIDENT_TYPES: { label: string; category: IncidentCard['category'] }[] = [
  { label: 'Phishing', category: 'Phishing' },
  { label: 'Job Scam', category: 'Jobs' },
  { label: 'Bank / Payment Fraud', category: 'Banks' },
  { label: 'Fake Transaction', category: 'Payments' },
  { label: 'Identity Theft', category: 'Identity' },
  { label: 'Other', category: 'Phishing' },
]

const MAX_CHARS = 280

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  const { colors, brand } = useTheme()
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={[
        styles.checkbox,
        {
          backgroundColor: checked ? brand.purpleCTA : 'transparent',
          borderColor: checked ? brand.purpleCTA : colors.borderWeak,
        },
      ]}
    >
      {checked && (
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_700Bold' }}>✓</Text>
      )}
    </Pressable>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReportScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { addReport } = useRadarStore()

  const [typeOpen, setTypeOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<typeof INCIDENT_TYPES[number] | null>(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [consented, setConsented] = useState(false)

  const canSubmit = selectedType !== null && description.length >= 20 && consented
  const remaining = MAX_CHARS - description.length

  function handleSubmit() {
    if (!canSubmit || !selectedType) return

    const headline = description.slice(0, 60).toLowerCase().replace(/[.!?]$/, '') + '…'

    const newCard: IncidentCard = {
      id: `report-${Date.now()}`,
      category: selectedType.category,
      variant: 'incident',
      headline,
      location: location.trim() || 'Unknown location',
      timestamp: 'just now',
      preview: description,
      upvotes: 0,
      comments: 0,
      verified: false,
    }

    addReport(newCard)
    router.replace('/(tabs)/radar')
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* Title */}
        <Text style={[type.heroTitle, { color: colors.textPrimary, marginTop: 16, marginBottom: 4 }]}>
          Report it.
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, lineHeight: 18, marginBottom: 28 }]}>
          Reporting fraud helps protect the next person. All reports are anonymous.
        </Text>

        {/* Section: add to radar */}
        <Text style={[type.label, { color: colors.textTertiary, marginBottom: 12 }]}>
          Add to our radar
        </Text>

        {/* Type dropdown */}
        <Text style={[type.bodySmall, { color: colors.textSecondary, marginBottom: 6 }]}>
          Incident type
        </Text>
        <Pressable
          onPress={() => setTypeOpen(!typeOpen)}
          style={[
            styles.input,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: typeOpen ? brand.purpleCTA : colors.borderWeak,
              borderWidth: typeOpen ? 1 : 0.5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
        >
          <Text
            style={[
              type.body,
              { color: selectedType ? colors.textPrimary : colors.textTertiary },
            ]}
          >
            {selectedType ? selectedType.label : 'Select type'}
          </Text>
          <ArrowIcon size={16} color={colors.textTertiary} direction={typeOpen ? 'up' : 'down'} />
        </Pressable>

        {/* Dropdown options */}
        {typeOpen && (
          <View
            style={[
              styles.dropdownList,
              { backgroundColor: colors.bgSecondary, borderColor: colors.borderWeak },
            ]}
          >
            {INCIDENT_TYPES.map((t) => (
              <Pressable
                key={t.label}
                onPress={() => { setSelectedType(t); setTypeOpen(false) }}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  {
                    backgroundColor:
                      selectedType?.label === t.label ? colors.bgTertiary : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    type.body,
                    {
                      color:
                        selectedType?.label === t.label ? colors.textPrimary : colors.textSecondary,
                      fontFamily:
                        selectedType?.label === t.label ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Description */}
        <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 16, marginBottom: 6 }]}>
          What happened?
        </Text>
        <TextInput
          value={description}
          onChangeText={(t) => setDescription(t.slice(0, MAX_CHARS))}
          placeholder="Describe what happened in your own words…"
          placeholderTextColor={colors.textTertiary}
          multiline
          style={[
            styles.textarea,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: description.length > 0 ? brand.purpleCTA : colors.borderWeak,
              borderWidth: description.length > 0 ? 1 : 0.5,
              color: colors.textPrimary,
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
            },
          ]}
        />
        <Text
          style={[
            type.bodySmall,
            {
              color: remaining < 30 ? colors.warningText : colors.textTertiary,
              textAlign: 'right',
              marginTop: 4,
            },
          ]}
        >
          {remaining} remaining
        </Text>

        {/* Location */}
        <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 12, marginBottom: 6 }]}>
          Location (city, optional)
        </Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. London, UK"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.borderWeak,
              color: colors.textPrimary,
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
            },
          ]}
        />

        {/* Consent */}
        <Pressable
          onPress={() => setConsented(!consented)}
          style={styles.consentRow}
        >
          <Checkbox checked={consented} onToggle={() => setConsented(!consented)} />
          <Text style={[type.body, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
            I confirm this is genuine and happened to me or someone I know
          </Text>
        </Pressable>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: brand.purpleCTA,
              opacity: !canSubmit ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[type.cardTitle, { color: '#FFFFFF' }]}>Submit report</Text>
        </Pressable>

        <Text
          style={[
            type.bodySmall,
            { color: colors.textTertiary, textAlign: 'center', marginTop: 12, lineHeight: 16 },
          ]}
        >
          Your identity is never shared. Reports are reviewed before appearing on radar.
        </Text>
      </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav activeTab="radar" />
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
  input: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textarea: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  dropdownList: {
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  submitBtn: {
    borderRadius: 50,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
})
