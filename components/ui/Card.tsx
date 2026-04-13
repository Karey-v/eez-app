import React from 'react'
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native'
import { useTheme } from '@/theme'

type Props = {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  brandColor?: string
  noBorder?: boolean
}

export function Card({ children, style, onPress, brandColor, noBorder }: Props) {
  const { colors, spacing } = useTheme()

  const cardStyle: ViewStyle = {
    backgroundColor: brandColor ?? colors.bgSecondary,
    borderRadius: 14,
    borderWidth: brandColor || noBorder ? 0 : 0.5,
    borderColor: colors.borderWeak,
    paddingHorizontal: spacing.cardH,
    paddingVertical: spacing.cardV,
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, style, pressed && { opacity: 0.85 }]}
      >
        {children}
      </Pressable>
    )
  }

  return <View style={[cardStyle, style]}>{children}</View>
}
