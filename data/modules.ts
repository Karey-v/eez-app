export type LessonType = 'text-visual' | 'swipe-reveal' | 'tap-uncover' | 'scenario' | 'quick-check'

export type LessonOption = {
  label: string
  correct?: boolean
  feedback: string
  variant?: 'red-flag' | 'pro-move' | 'neutral'
}

export type Hotspot = {
  id: string
  label: string
  explanation: string
}

export type Lesson = {
  id: number
  type: LessonType
  title: string
  subtitle?: string
  body?: string
  insight?: string
  revealLabel?: string
  revealAnswer?: string
  hotspots?: Hotspot[]
  options?: LessonOption[]
}

export type Module = {
  id: string
  title: string
  tag: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  locked: boolean
  xp: number
  badgeId: string
  whatYoullLearn: string[]
  lessons: Lesson[]
}

export const modules: Module[] = [
  {
    id: 'password-glow-up',
    title: 'Password Glow-Up',
    tag: '🔑 Passwords',
    duration: '4 mins',
    difficulty: 'Beginner',
    locked: false,
    xp: 50,
    badgeId: 'password-pro',
    whatYoullLearn: [
      'The "Skeleton Key" trap',
      'The "Passphrase" hack',
      'Setting up your "Identity Armor"',
    ],
    lessons: [
      {
        id: 1,
        type: 'text-visual',
        title: 'one key to rule them all? 🚩',
        body: 'Using the same password across multiple accounts is called credential stuffing bait. When one site gets breached — and they do — attackers try that password everywhere.\n\nYour email password is especially critical. It\'s the master key to everything else.',
        insight: 'In 2023, over 8 billion credentials were leaked in the "RockYou2023" data dump. If you reuse passwords, chances are yours is in there.',
      },
      {
        id: 2,
        type: 'swipe-reveal',
        title: 'speed dating... with a scammer.',
        subtitle: 'How long to crack "Password123"?',
        revealLabel: 'Swipe to reveal',
        revealAnswer: 'Less than 1 second.',
        body: 'Modern cracking tools can test billions of passwords per second. Dictionary words, names, and simple substitutions (p@ssw0rd) are all in the list.',
      },
      {
        id: 3,
        type: 'tap-uncover',
        title: 'build your identity armor.',
        body: 'This passphrase is strong — tap each part to find out why.',
        hotspots: [
          {
            id: 'word1',
            label: 'Neon-Mango',
            explanation: 'Random unrelated words make passphrases virtually unguessable, even without special characters.',
          },
          {
            id: 'word2',
            label: 'Running',
            explanation: 'Three or more words exponentially increases the number of combinations — even supercomputers struggle.',
          },
          {
            id: 'word3',
            label: '2026!',
            explanation: 'Adding a number and symbol satisfies site requirements without making it hard to remember.',
          },
        ],
      },
      {
        id: 4,
        type: 'scenario',
        title: 'you have 40+ accounts. what do you do?',
        options: [
          {
            label: 'Save passwords in the Notes app',
            correct: false,
            variant: 'red-flag',
            feedback: 'Notes app is unencrypted. If someone gets your phone, they get everything.',
          },
          {
            label: 'Use a password manager',
            correct: true,
            variant: 'pro-move',
            feedback: 'One strong master password protects everything else. 1Password, Bitwarden, and Apple Keychain are all solid options.',
          },
          {
            label: 'Same base password + site name (e.g. Netflix22, Insta22)',
            correct: false,
            variant: 'red-flag',
            feedback: 'Scammers know this trick. Once they get one, a script tries all the variations.',
          },
        ],
      },
      {
        id: 5,
        type: 'quick-check',
        title: 'what\'s the strongest second layer?',
        options: [
          {
            label: 'SMS codes (text message)',
            correct: false,
            feedback: 'SMS codes can be intercepted via SIM swapping. Better than nothing — but not the best.',
          },
          {
            label: 'Authenticator apps (Google/Authy)',
            correct: true,
            feedback: 'Authenticator apps generate codes on your device — they can\'t be intercepted remotely.',
          },
          {
            label: 'Security questions',
            correct: false,
            feedback: 'Security questions are often guessable from social media. Avoid where possible.',
          },
        ],
      },
    ],
  },
  {
    id: 'link-hygiene',
    title: 'Link & Message Hygiene',
    tag: '🔗 Phishing',
    duration: '5 mins',
    difficulty: 'Beginner',
    locked: true,
    xp: 50,
    badgeId: 'link-legend',
    whatYoullLearn: ['Spotting phishing links', 'Safe link checking', 'Protecting your DMs'],
    lessons: [],
  },
  {
    id: 'device-safety',
    title: 'Device Safety',
    tag: '📱 Devices',
    duration: '4 mins',
    difficulty: 'Intermediate',
    locked: true,
    xp: 60,
    badgeId: 'device-defender',
    whatYoullLearn: ['App permissions', 'Public Wi-Fi risks', 'Screen lock best practices'],
    lessons: [],
  },
]
