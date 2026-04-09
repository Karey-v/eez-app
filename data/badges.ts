export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export const badges: Badge[] = [
  {
    id: 'password-pro',
    name: 'Password Pro',
    description: 'Completed the Password Glow-Up module',
    icon: '🔑',
    color: '#5B5CF6',
  },
  {
    id: 'link-legend',
    name: 'Link Legend',
    description: 'Completed Link & Message Hygiene',
    icon: '🔗',
    color: '#007549',
  },
  {
    id: 'device-defender',
    name: 'Device Defender',
    description: 'Completed Device Safety module',
    icon: '📱',
    color: '#FF732E',
  },
  {
    id: 'on-lock-band',
    name: 'On Lock',
    description: 'Achieved the On Lock band on the leakability test',
    icon: '🔒',
    color: '#007549',
  },
  {
    id: 'radar-reporter',
    name: 'Radar Reporter',
    description: 'Submitted your first fraud report',
    icon: '📡',
    color: '#602CFF',
  },
]
