import React from 'react'
import Svg, { Path } from 'react-native-svg'

type Props = { size?: number; color?: string }

export function ChatBubbleIcon({ size = 20, color = 'currentColor' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityLabel="Feed">
      <Path
        d="M4 2h16a2 2 0 012 2v11a2 2 0 01-2 2H8l-5 5V4a2 2 0 012-2z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  )
}
