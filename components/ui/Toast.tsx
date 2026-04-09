import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CheckIcon } from '@/components/icons/Check'
import { WarningIcon } from '@/components/icons/Warning'

type ToastType = 'confirm' | 'warning'

type Props = {
  message: string
  type?: ToastType
  visible: boolean
  onHide: () => void
}

export function Toast({ message, type = 'confirm', visible, onHide }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(100)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      translateY.value = withSequence(
        withTiming(-12, { duration: 250 }),
        withDelay(2500, withTiming(100, { duration: 250 }))
      )
      opacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withDelay(2500, withTiming(0, { duration: 250 }, () => runOnJS(onHide)()))
      )
    }
  }, [visible])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  const iconColor = type === 'confirm' ? colors.successText : colors.warningText

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.bgSecondary, bottom: insets.bottom + 70 },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View style={{ marginRight: 8 }}>
        {type === 'confirm' ? (
          <CheckIcon size={14} color={iconColor} />
        ) : (
          <WarningIcon size={14} color={iconColor} />
        )}
      </View>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textPrimary, flexShrink: 1 }}>
        {message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    maxWidth: 360,
    zIndex: 999,
  },
})
