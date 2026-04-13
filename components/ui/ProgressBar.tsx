import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated'
import { useTheme } from '@/theme'

type Props = {
  progress: number   // 0–1
  height?: number
  fillColor?: string
  trackColor?: string
  delay?: number     // ms delay before animating (for staggered reveals)
  style?: object
}

export function ProgressBar({ progress, height = 2, fillColor = '#5B5CF6', trackColor, delay = 0, style }: Props) {
  const { colors } = useTheme()
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.min(1, Math.max(0, progress)), {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    )
  }, [progress, delay])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }))

  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? colors.bgSecondary,
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
