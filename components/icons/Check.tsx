import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'

type Props = { size?: number; color?: string; circled?: boolean }

export function CheckIcon({ size = 24, color = 'currentColor', circled = false }: Props) {
  if (circled) {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        accessibilityLabel="Check"
      >
        <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
        <Path
          d="M8 12l3 3 5-5"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    )
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityLabel="Check"
    >
      <Path
        d="M4 12l5 5L20 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
