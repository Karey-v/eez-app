import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'

type Props = { size?: number; color?: string }

export function MapPinIcon({ size = 20, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityLabel="Map">
      <Path
        d="M12 2C8.69 2 6 4.69 6 8c0 5 6 14 6 14s6-9 6-14c0-3.31-2.69-6-6-6z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={8} r={2.5} stroke={color} strokeWidth={1.8} />
    </Svg>
  )
}
