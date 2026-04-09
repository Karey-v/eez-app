import React from 'react'
import { View, Text, ViewStyle } from 'react-native'
import { useTheme } from '@/theme'

type Band = 'On Lock' | 'Fast Lane' | 'Main Character' | 'Loose Link'

const BAND_COLORS: Record<Band, { bg: string; text: string }> = {
  'On Lock':        { bg: '#007549', text: '#FFFFFF' },
  'Fast Lane':      { bg: '#5B5CF6', text: '#FFFFFF' },
  'Main Character': { bg: '#FF732E', text: '#FFFFFF' },
  'Loose Link':     { bg: '#CC0000', text: '#FFFFFF' },
}

type Props = {
  label: string
  band?: Band
  customBg?: string
  customText?: string
  style?: ViewStyle
}

export function BadgeChip({ label, band, customBg, customText, style }: Props) {
  const bg = customBg ?? (band ? BAND_COLORS[band].bg : '#D2D9FF')
  const textColor = customText ?? (band ? BAND_COLORS[band].text : '#0A0A0A')

  return (
    <View
      style={[
        {
          borderRadius: 20,
          paddingVertical: 3,
          paddingHorizontal: 10,
          backgroundColor: bg,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: textColor,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
