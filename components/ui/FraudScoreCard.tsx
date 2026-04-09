import React, { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

type Props = {
  likelihood: number        // 0–100
  level: RiskLevel
  redFlags: string[]
  looksOkay?: string[]
  whatToDoNext: string
  onGuidePress?: () => void
}

const RISK_CONFIG = {
  LOW: {
    label: 'LOW RISK',
    getBg: (colors: any) => colors.successBg,
    getText: (colors: any) => colors.successText,
  },
  MEDIUM: {
    label: 'MEDIUM RISK',
    getBg: (colors: any) => colors.warningBg,
    getText: (colors: any) => colors.warningText,
  },
  HIGH: {
    label: 'HIGH RISK',
    getBg: (colors: any) => colors.dangerBg,
    getText: (colors: any) => colors.dangerText,
  },
}

export function FraudScoreCard({
  likelihood,
  level,
  redFlags,
  looksOkay,
  whatToDoNext,
  onGuidePress,
}: Props) {
  const { colors, type } = useTheme()
  const barWidth = useSharedValue(0)

  useEffect(() => {
    barWidth.value = withTiming(likelihood / 100, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
  }, [likelihood])

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }))

  const config = RISK_CONFIG[level]
  const pillBg = config.getBg(colors)
  const pillText = config.getText(colors)

  return (
    <View
      style={{
        backgroundColor: colors.bgSecondary,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.borderWeak,
        padding: 12,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[type.meta, { color: colors.textTertiary }]}>fraud likelihood</Text>
        <View
          style={{
            backgroundColor: pillBg,
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <View
            style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: pillText }}
          />
          <Text style={[type.meta, { color: pillText }]}>{config.label}</Text>
        </View>
      </View>

      {/* Score bar */}
      <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.bgTertiary,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              { height: 6, borderRadius: 3, backgroundColor: pillText },
              barStyle,
            ]}
          />
        </View>
        <Text style={[type.bodySmall, { color: colors.textPrimary, fontFamily: 'Inter_700Bold', fontWeight: '700', minWidth: 32, textAlign: 'right' }]}>
          {likelihood}%
        </Text>
      </View>

      {/* Separator */}
      <View style={{ height: 0.5, backgroundColor: colors.borderWeak, marginVertical: 10 }} />

      {/* Red flags */}
      <Text style={[type.meta, { color: colors.textTertiary, marginBottom: 6 }]}>
        red flags detected
      </Text>
      {redFlags.map((flag, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dangerText }} />
          <Text style={[type.bodySmall, { color: colors.textPrimary, flex: 1 }]}>{flag}</Text>
        </View>
      ))}

      {/* Looks okay */}
      {looksOkay && looksOkay.length > 0 ? (
        <>
          <View style={{ height: 0.5, backgroundColor: colors.borderWeak, marginVertical: 10 }} />
          <Text style={[type.meta, { color: colors.textTertiary, marginBottom: 6 }]}>looks okay</Text>
          {looksOkay.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.successText }} />
              <Text style={[type.bodySmall, { color: colors.textPrimary, flex: 1 }]}>{item}</Text>
            </View>
          ))}
        </>
      ) : null}

      {/* What to do next */}
      <View style={{ height: 0.5, backgroundColor: colors.borderWeak, marginVertical: 10 }} />
      <Text style={[type.meta, { color: colors.textTertiary, marginBottom: 6 }]}>what to do next</Text>
      <Text style={[type.body, { color: colors.textPrimary }]}>{whatToDoNext}</Text>

      {/* Guide button — only HIGH risk */}
      {level === 'HIGH' && onGuidePress ? (
        <Pressable
          onPress={onGuidePress}
          style={({ pressed }) => ({
            marginTop: 12,
            borderRadius: 50,
            minHeight: 44,
            borderWidth: 1.5,
            borderColor: colors.borderMid,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>
            go to step-by-step guide →
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}
