import React from 'react'
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native'
import { useTheme } from '@/theme'

type Variant = 'purple' | 'orange' | 'lime' | 'outline' | 'ghost'

type Props = {
  label: string
  onPress: () => void
  variant?: Variant
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function Button({
  label,
  onPress,
  variant = 'purple',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
}: Props) {
  const { colors } = useTheme()

  const containerStyle: ViewStyle = {
    borderRadius: 50,
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: fullWidth ? 'stretch' : 'center',
    flexDirection: 'row',
    opacity: disabled ? 0.4 : 1,
    ...getVariantContainer(variant, colors),
  }

  const textStyle: TextStyle = {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    ...getVariantText(variant, colors),
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        containerStyle,
        pressed && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getVariantText(variant, colors).color} size="small" />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </Pressable>
  )
}

function getVariantContainer(variant: Variant, colors: ReturnType<typeof useTheme>['colors']): ViewStyle {
  switch (variant) {
    case 'purple':
      return { backgroundColor: '#5B5CF6' }
    case 'orange':
      return { backgroundColor: '#F4632A' }
    case 'lime':
      return { backgroundColor: '#B1FF58' }
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.borderMid,
      }
    case 'ghost':
      return { backgroundColor: 'transparent' }
  }
}

function getVariantText(variant: Variant, colors: ReturnType<typeof useTheme>['colors']): TextStyle {
  switch (variant) {
    case 'purple':
      return { color: '#FFFFFF' }
    case 'orange':
      return { color: '#FFFFFF' }
    case 'lime':
      return { color: '#1A4A00' }
    case 'outline':
      return { color: colors.textPrimary }
    case 'ghost':
      return { color: colors.textSecondary, textDecorationLine: 'underline' }
  }
}
