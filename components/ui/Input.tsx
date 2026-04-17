import React, { useState } from 'react'
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native'
import { useTheme } from '@/theme'

type Props = TextInputProps & {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  multiline?: boolean
  maxLength?: number
  showCharCount?: boolean
}

export function Input({
  label,
  error,
  containerStyle,
  multiline = false,
  maxLength,
  showCharCount = false,
  value,
  ...rest
}: Props) {
  const { colors, spacing } = useTheme()
  const [focused, setFocused] = useState(false)

  const inputStyle = {
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    borderWidth: focused ? 1 : 0.5,
    borderColor: focused ? '#5B5CF6' : 'rgba(98,44,255,0.2)',
    paddingVertical: spacing.inputV,
    paddingHorizontal: spacing.inputH,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textPrimary,
    minHeight: multiline ? 100 : 44,
    textAlignVertical: multiline ? 'top' as const : undefined,
  }

  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 10,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 6,
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.textTertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline={multiline}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      {(error || (showCharCount && maxLength)) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          {error ? (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.dangerText }}>
              {error}
            </Text>
          ) : <View />}
          {showCharCount && maxLength ? (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textTertiary }}>
              {(value as string)?.length ?? 0}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}
