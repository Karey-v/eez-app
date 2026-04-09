import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

type Props = { size?: number; color?: string; filled?: boolean }

export function ProfileIcon({ size = 20, color = 'currentColor', filled = false }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Profile"
    >
      <Circle
        cx={12}
        cy={8}
        r={4}
        stroke={color}
        strokeWidth={2}
        fill={filled ? color : 'none'}
      />
      <Path
        d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}
