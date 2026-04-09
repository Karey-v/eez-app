import React from 'react'
import Svg, { Path } from 'react-native-svg'

type Props = { size?: number; color?: string; direction?: 'right' | 'left' | 'up' | 'down' }

export function ArrowIcon({ size = 24, color = 'currentColor', direction = 'right' }: Props) {
  const rotations = { right: 0, down: 90, left: 180, up: 270 }
  const rotation = rotations[direction]

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
      accessibilityLabel={`Arrow ${direction}`}
    >
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
