import React from 'react'
import Svg, { Path } from 'react-native-svg'

type Props = { size?: number; color?: string; strokeWidth?: number }

export function ShieldIcon({ size = 24, color = 'currentColor', strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Shield"
    >
      <Path
        d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
