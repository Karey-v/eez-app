import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { useTheme } from '@/theme'

type Props = {
  progress: number   // 0–1
  height?: number
  fillColor?: string
  style?: object
}

export function ProgressBar({ progress, height = 2, fillColor = '#5B5CF6', style }: Props) {
  const { colors } = useTheme()
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: 300,
      easing: Easing.out(Easing.ease),
    })
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }))

  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: colors.bgSecondary,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height,
            borderRadius: height / 2,
            backgroundColor: fillColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  )
}
