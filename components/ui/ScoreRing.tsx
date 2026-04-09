import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from '@/theme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

type Props = {
  score: number      // 0–48
  size?: number
  strokeWidth?: number
  bandColor?: string
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, bandColor = '#5B5CF6' }: Props) {
  const { colors, type } = useTheme()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(score / 48, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    })
  }, [score])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }))

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bgSecondary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bandColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text
        style={[
          type.heroTitle,
          { fontSize: 32, color: bandColor, fontFamily: 'DMSerifDisplay_400Regular' },
        ]}
      >
        {score}
      </Text>
    </View>
  )
}
