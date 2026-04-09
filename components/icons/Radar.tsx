import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

type Props = { size?: number; color?: string; filled?: boolean }

export function RadarIcon({ size = 20, color = 'currentColor', filled = false }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Radar"
    >
      <Circle
        cx={12}
        cy={12}
        r={9}
        stroke={color}
        strokeWidth={2}
        fill={filled ? color : 'none'}
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M12 3v4M12 17v4M3 12h4M17 12h4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}
