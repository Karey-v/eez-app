import React from 'react'
import Svg, { Path } from 'react-native-svg'

type Props = { size?: number; color?: string; filled?: boolean }

export function SparkleIcon({ size = 24, color = 'currentColor', filled = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityLabel="Sparkle">
      <Path
        d="M12 3L13.5 10.5L21 12L13.5 13.5L12 21L10.5 13.5L3 12L10.5 10.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  )
}
