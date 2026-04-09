import React from 'react'
import Svg, { Path } from 'react-native-svg'

type Props = { size?: number; color?: string; filled?: boolean }

export function LearnIcon({ size = 20, color = 'currentColor', filled = false }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Learn"
    >
      <Path
        d="M12 3L2 8l10 5 10-5-10-5z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      <Path
        d="M2 8v6M6 10.5v5a6 6 0 0012 0v-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
