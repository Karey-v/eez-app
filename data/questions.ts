export type QuestionType = 'simulation-tap' | 'slider' | 'multiple-choice' | 'scenario'

export type Question = {
  id: number
  category: 'Impulse' | 'Habits' | 'Social Pressure' | 'Verification' | 'Response Style'
  type: QuestionType
  prompt?: string
  simulation?: {
    uiType: 'message' | 'email' | 'alert' | 'notification' | 'wifi-settings' | 'reward-popup' | 'message-actions' | 'instagram-dm' | 'browser'
    sender: string
    content: string
    preview?: string
  }
  options?: {
    label: string
    score: number
    feedback?: string
  }[]
  sliderLabels?: { left: string; right: string }
}

export const questions: Question[] = [
  {
    id: 1,
    category: 'Impulse',
    type: 'simulation-tap',
    prompt: 'you get this notification. what do you do?',
    simulation: {
      uiType: 'notification',
      sender: 'Apple Pay',
      content: 'Your account has been temporarily suspended. Tap to verify your identity and restore access immediately.',
      preview: 'Action required: verify now',
    },
    options: [
      { label: 'Tap the notification immediately', score: -1, feedback: 'this is a classic urgency trap — real apps never suspend via notification.' },
      { label: 'Open the app directly to check', score: 3, feedback: 'smart. always go directly to the source.' },
      { label: 'Screenshot and Google it first', score: 1, feedback: 'good instinct — a quick search often reveals the scam.' },
      { label: 'Ignore it, probably spam', score: -1, feedback: 'mostly right, but ignoring without checking can miss real alerts.' },
    ],
  },
  {
    id: 2,
    category: 'Habits',
    type: 'slider',
    prompt: 'how many of your accounts share the same password or a variation of it?',
    sliderLabels: { left: 'none (unique passwords)', right: 'most of them' },
    options: [
      { label: '0', score: 3 },
      { label: '1', score: 1 },
      { label: '2', score: -1 },
      { label: '3+', score: -3 },
    ],
  },
  {
    id: 3,
    category: 'Social Pressure',
    type: 'simulation-tap',
    prompt: 'your mate sends this. what do you do?',
    simulation: {
      uiType: 'message',
      sender: 'Jake 🏀',
      content: "hey bro can you log into my netflix for me? i forgot my password and im tryna watch something. just send me your login real quick",
      preview: 'hey bro can you log into my netflix',
    },
    options: [
      { label: 'Send the login — it\'s just Jake', score: -3, feedback: 'even trusted friends can be hacked. never share passwords.' },
      { label: 'Call to verify it\'s actually him', score: 1, feedback: 'exactly right. verify identity before sharing anything.' },
      { label: 'Ask him to reset his own password', score: 3, feedback: 'good redirect — avoids sharing while helping.' },
      { label: 'Ignore the message', score: 1, feedback: 'safe but not ideal — his account may be compromised.' },
    ],
  },
  {
    id: 4,
    category: 'Verification',
    type: 'simulation-tap',
    prompt: 'this email hits your inbox. what\'s your move?',
    simulation: {
      uiType: 'email',
      sender: 'security@appIe-support.com',
      content: 'Important: Your Apple ID requires immediate verification. Your account will be permanently deleted in 24 hours if you do not update your information. Click here to verify.',
      preview: 'Action required: 24-hour deadline',
    },
    options: [
      { label: 'Click the verification link', score: -3, feedback: 'appIe ≠ apple. that lowercase "L" is a classic phishing tell.' },
      { label: 'Check the sender domain first', score: 1, feedback: 'spot on. the domain "appIe-support.com" is fake.' },
      { label: 'Forward to a friend to check', score: 2, feedback: 'risky — you\'re spreading a phishing link.' },
      { label: 'Delete it, looks sketchy', score: 3, feedback: 'right call, but knowing exactly why helps next time.' },
    ],
  },
  {
    id: 5,
    category: 'Response Style',
    type: 'multiple-choice',
    prompt: 'you\'re browsing and suddenly your screen shows a loud warning: "VIRUS DETECTED — call Microsoft Support at 1-800-XXX-XXXX". what do you do?',
    options: [
      { label: 'Call the number — better safe than sorry', score: 3, feedback: 'microsoft never contacts you this way. this is a tech support scam.' },
      { label: 'Close the browser tab immediately', score: 1, feedback: 'correct. these are fake browser alerts — close and move on.' },
      { label: 'Screenshot it and ask someone', score: -1, feedback: 'not bad — getting a second opinion is smart.' },
      { label: 'Run your actual antivirus software', score: -3, feedback: 'good instinct — trust your own tools, not pop-up warnings.' },
    ],
  },
  {
    id: 6,
    category: 'Habits',
    type: 'simulation-tap',
    prompt: "you're at a coffee shop. pick a network.",
    simulation: {
      uiType: 'wifi-settings',
      sender: 'Wi-Fi',
      content: '',
    },
    options: [
      { label: 'Free City WiFi', score: -3, feedback: 'open public networks can be intercepted. never use them for banking.' },
      { label: 'Coffee House WiFi', score: 2, feedback: 'named networks can be spoofed by attackers. still risky without a VPN.' },
      { label: 'Mobile Data', score: 3, feedback: 'smart. your own data connection is the safest option.' },
      { label: 'VPN On', score: 1, feedback: 'good — a VPN significantly reduces risk on public networks.' },
    ],
  },
  {
    id: 7,
    category: 'Impulse',
    type: 'simulation-tap',
    prompt: 'a popup appears. what do you tap?',
    simulation: {
      uiType: 'reward-popup',
      sender: 'Promo',
      content: 'Claim your £500 gift card before the offer expires. Limited time only.',
    },
    options: [
      { label: 'Claim my reward', score: -3, feedback: 'artificial urgency is a classic scam tactic. there is no prize.' },
      { label: 'Close it', score: 3, feedback: 'correct. dismiss and move on.' },
      { label: 'Terms & Conditions', score: -1, feedback: 'curious but risky — the link itself could be malicious.' },
    ],
  },
  {
    id: 8,
    category: 'Verification',
    type: 'simulation-tap',
    prompt: 'you get this from an unknown number. what do you do?',
    simulation: {
      uiType: 'message-actions',
      sender: '+44 7700 900123',
      content: 'BARCLAYS: Unusual activity detected on your account. Call our fraud team immediately on 0800-XXX-XXXX to prevent your account being frozen.',
      preview: 'Unusual activity detected',
    },
    options: [
      { label: 'Call the number', score: -3, feedback: 'never call numbers from messages. find the official number on your card.' },
      { label: 'Report as spam', score: 3, feedback: 'perfect. report and block — this is a smishing attempt.' },
      { label: 'Go back', score: 2, feedback: 'good. ignoring suspicious messages is the right move.' },
    ],
  },
  {
    id: 9,
    category: 'Social Pressure',
    type: 'simulation-tap',
    prompt: 'your friend sends you this DM. what do you do?',
    simulation: {
      uiType: 'instagram-dm',
      sender: 'priya.m',
      content: "omg I made £800 in 2 days!! this is actually legit, just put in £50 👀 bit.ly/inv-promo",
    },
    options: [
      { label: 'Tap the bit.ly link', score: -3, feedback: "shortened links hide destinations — don't tap. verify with Priya directly." },
      { label: 'Reply to ask more', score: 1, feedback: 'engaging keeps the scam alive. the account may be compromised.' },
      { label: 'Report & delete', score: 2, feedback: 'smart. accounts can be hijacked — reporting protects others.' },
    ],
  },
  {
    id: 10,
    category: 'Response Style',
    type: 'simulation-tap',
    prompt: 'you click a link and this page loads. what do you do?',
    simulation: {
      uiType: 'browser',
      sender: 'bankk-secure-login.co.uk',
      content: 'Sign in to your account',
      preview: '⚠️ Not Secure',
    },
    options: [
      { label: 'Enter my login details', score: -3, feedback: "the URL is fake — 'bankk' is not your bank. entering credentials hands them to scammers." },
      { label: 'Tap the ⚠️ warning', score: 1, feedback: 'exactly right. always check the URL and security indicator before typing anything.' },
    ],
  },
]

export const BANDS = [
  { label: 'On Lock',     min: 80, max: 100, color: '#007549', personality: "you're The Sentinel.",    description: "Tight instincts. Hard to crack.",                  cta: "Keep it up." },
  { label: 'Mostly Safe', min: 60, max: 79,  color: '#22C55E', personality: "you're The Guardian.",    description: "Solid habits, just a few gaps to close.",          cta: "Stay sharp." },
  { label: 'Kinda Leaky', min: 40, max: 59,  color: '#FF9500', personality: "you're The Soft Lock.",   description: "Trying, but some things still slip through.",      cta: "One more step." },
  { label: 'Wide Open',   min: 0,  max: 39,  color: '#FF3B30', personality: "you're The Open Door.",   description: "Exposed in ways you might not realise.",           cta: "Start with one fix." },
]

export function getBand(scaledScore: number) {
  return BANDS.find((b) => scaledScore >= b.min && scaledScore <= b.max) ?? BANDS[BANDS.length - 1]
}

export function scaleScore(rawScore: number): number {
  return Math.round(Math.max(0, Math.min(100, ((rawScore + 30) / 60) * 100)))
}
