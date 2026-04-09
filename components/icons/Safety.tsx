import React from 'react'
import Svg, { Path } from 'react-native-svg'

type Props = { size?: number; color?: string; filled?: boolean }

export function SafetyIcon({ size = 20, color = 'currentColor', filled = false }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Safety"
    >
      <Path
        d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={filled ? (color === '#5B5CF6' ? '#fff' : '#fff') : color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
