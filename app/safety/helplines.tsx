// S49 — Helplines (stub)
// Display-only list. Copy contact to clipboard on press.
import { View, Text, ScrollView, Pressable, StyleSheet, Share } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { ArrowIcon } from '@/components/icons/Arrow'
import { BottomNav } from '@/components/ui/BottomNav'
import { helplines } from '@/data/helplines'

export default function HelplinesScreen() {
  const { colors, type, spacing, brand } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)

  async function copyContact(id: string, contact: string) {
    try {
      await Share.share({ message: contact })
    } catch {}
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: spacing.screenH,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ArrowIcon size={20} color={colors.textPrimary} direction="left" />
        </Pressable>

        <Text style={[type.heroTitle, { color: '#5B5CF6', marginTop: 16, marginBottom: 6 }]}>
          Helplines.
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, marginBottom: 24, lineHeight: 18 }]}>
          real people, real help. all free.
        </Text>

        {helplines.map((line, i) => (
          <View
            key={line.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.bgPrimary,
                borderColor: colors.borderWeak,
                marginBottom: spacing.cardGap,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[type.cardTitle, { color: colors.textPrimary, flex: 1 }]}>{line.name}</Text>
              <Pressable
                onPress={() => copyContact(line.id, line.contact)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.copyBtn,
                  {
                    backgroundColor: copied === line.id ? colors.successBg : colors.bgSecondary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    type.label,
                    { color: copied === line.id ? colors.successText : colors.textTertiary },
                  ]}
                >
                  {copied === line.id ? 'copied ✓' : 'copy'}
                </Text>
              </Pressable>
            </View>

            <Text style={[type.body, { color: colors.textSecondary, marginTop: 4, lineHeight: 18 }]}>
              {line.description}
            </Text>
            <Text style={[type.label, { color: brand.purpleCTA, marginTop: 8 }]}>{line.contact}</Text>
            <Text style={[type.bodySmall, { color: colors.textTertiary, marginTop: 4 }]}>
              {line.available}
            </Text>
          </View>
        ))}
      </ScrollView>
      <BottomNav activeTab="home" />
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
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copyBtn: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
})
