export type QuestionType = 'simulation-tap' | 'slider' | 'multiple-choice' | 'scenario'

export type Question = {
  id: number
  category: 'Impulse' | 'Habits' | 'Social Pressure' | 'Verification' | 'Response Style'
  type: QuestionType
  prompt?: string
  simulation?: {
    uiType: 'message' | 'email' | 'alert' | 'notification'
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
      { label: 'Tap the notification immediately', score: 3, feedback: 'this is a classic urgency trap — real apps never suspend via notification.' },
      { label: 'Open the app directly to check', score: 0, feedback: 'smart. always go directly to the source.' },
      { label: 'Screenshot and Google it first', score: 1, feedback: 'good instinct — a quick search often reveals the scam.' },
      { label: 'Ignore it, probably spam', score: 1, feedback: 'mostly right, but ignoring without checking can miss real alerts.' },
    ],
  },
  {
    id: 2,
    category: 'Habits',
    type: 'slider',
    prompt: 'how many of your accounts share the same password or a variation of it?',
    sliderLabels: { left: 'none (unique passwords)', right: 'most of them' },
    options: [
      { label: '0', score: 0 },
      { label: '1', score: 1 },
      { label: '2', score: 2 },
      { label: '3+', score: 3 },
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
      { label: 'Send the login — it\'s just Jake', score: 3, feedback: 'even trusted friends can be hacked. never share passwords.' },
      { label: 'Call to verify it\'s actually him', score: 0, feedback: 'exactly right. verify identity before sharing anything.' },
      { label: 'Ask him to reset his own password', score: 1, feedback: 'good redirect — avoids sharing while helping.' },
      { label: 'Ignore the message', score: 2, feedback: 'safe but not ideal — his account may be compromised.' },
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
      { label: 'Click the verification link', score: 3, feedback: 'appIe ≠ apple. that lowercase "L" is a classic phishing tell.' },
      { label: 'Check the sender domain first', score: 0, feedback: 'spot on. the domain "appIe-support.com" is fake.' },
      { label: 'Forward to a friend to check', score: 2, feedback: 'risky — you\'re spreading a phishing link.' },
      { label: 'Delete it, looks sketchy', score: 1, feedback: 'right call, but knowing exactly why helps next time.' },
    ],
  },
  {
    id: 5,
    category: 'Response Style',
    type: 'multiple-choice',
    prompt: 'you\'re browsing and suddenly your screen shows a loud warning: "VIRUS DETECTED — call Microsoft Support at 1-800-XXX-XXXX". what do you do?',
    options: [
      { label: 'Call the number — better safe than sorry', score: 3, feedback: 'microsoft never contacts you this way. this is a tech support scam.' },
      { label: 'Close the browser tab immediately', score: 0, feedback: 'correct. these are fake browser alerts — close and move on.' },
      { label: 'Screenshot it and ask someone', score: 1, feedback: 'not bad — getting a second opinion is smart.' },
      { label: 'Run your actual antivirus software', score: 0, feedback: 'good instinct — trust your own tools, not pop-up warnings.' },
    ],
  },
  {
    id: 6,
    category: 'Habits',
    type: 'scenario',
    prompt: 'you\'re at a coffee shop. you connect to the free Wi-Fi to check your bank app. how risky is this?',
    options: [
      { label: 'Totally fine, Wi-Fi is Wi-Fi', score: 3, feedback: 'public Wi-Fi can be intercepted. use mobile data for banking.' },
      { label: 'Risky — I\'d use my mobile data instead', score: 0, feedback: 'exactly right. financial apps = mobile data only.' },
      { label: 'Fine if it\'s a named network like "Costa Coffee"', score: 2, feedback: 'attackers can spoof named networks. still a risk.' },
      { label: 'I\'d use a VPN first', score: 1, feedback: 'smart — a VPN significantly reduces the risk.' },
    ],
  },
  {
    id: 7,
    category: 'Impulse',
    type: 'simulation-tap',
    prompt: 'this pops up on Instagram. what do you do?',
    simulation: {
      uiType: 'notification',
      sender: 'instagram_official_promo',
      content: "🎉 You've been selected! You are 1 of 500 users chosen for our exclusive £500 gift card giveaway. Claim in the next 10 minutes or lose your spot!",
      preview: 'Claim your £500 reward',
    },
    options: [
      { label: 'Tap to claim — sounds legit', score: 3, feedback: 'artificial urgency is a red flag. real giveaways never expire in 10 minutes.' },
      { label: 'Check the account\'s profile first', score: 1, feedback: 'better — but a fake verified-looking account can still fool you.' },
      { label: 'Report the account as spam', score: 0, feedback: 'great response. you\'re protecting yourself and others.' },
      { label: 'Ignore it', score: 0, feedback: 'correct. if it sounds too good to be true, it is.' },
    ],
  },
  {
    id: 8,
    category: 'Verification',
    type: 'simulation-tap',
    prompt: 'you get this message out of nowhere. what do you do?',
    simulation: {
      uiType: 'message',
      sender: 'Barclays',
      content: 'BARCLAYS: Unusual activity detected on your account. Please call our fraud team immediately on 0800-XXX-XXXX to prevent your account from being frozen.',
      preview: 'Unusual activity detected',
    },
    options: [
      { label: 'Call the number in the message', score: 3, feedback: 'never call numbers from messages. find the official number on your card.' },
      { label: 'Call the number on the back of your card', score: 0, feedback: 'perfect. the official number on your card is always safe.' },
      { label: 'Reply to the message asking for more info', score: 2, feedback: 'risky — you\'re engaging with a potential scammer.' },
      { label: 'Ignore it and check the app', score: 1, feedback: 'mostly right — go to the app, not the message.' },
    ],
  },
  {
    id: 9,
    category: 'Social Pressure',
    type: 'simulation-tap',
    prompt: 'your cousin sends this in the family group chat. what do you do?',
    simulation: {
      uiType: 'message',
      sender: 'Cousin Priya 👑',
      content: "guys check this out I made £800 in 2 days!! this investment platform is legit, you just put in £50 and watch it grow 😭 here's my ref link",
      preview: 'I made £800 in 2 days!!',
    },
    options: [
      { label: 'Click the link — Priya wouldn\'t lie', score: 3, feedback: 'family members get hacked too. this is a classic pig butchering scam pattern.' },
      { label: 'Message Priya privately to verify', score: 0, feedback: 'smart. confirm via a different channel before clicking anything.' },
      { label: 'Do my own research on the platform first', score: 1, feedback: 'good instinct — but don\'t use the link itself to research.' },
      { label: 'Warn the group it might be a scam', score: 0, feedback: 'brave and correct. protecting others is always the right move.' },
    ],
  },
  {
    id: 10,
    category: 'Response Style',
    type: 'multiple-choice',
    prompt: 'you click a link and the page looks like your bank\'s website — but the URL is "bankk-secure-login.co.uk". what do you do?',
    options: [
      { label: 'Log in — the page looks legit', score: 3, feedback: 'visual appearance is easy to fake. the URL is the real tell.' },
      { label: 'Check the URL more carefully and leave', score: 0, feedback: 'exactly right. always verify the URL before entering credentials.' },
      { label: 'Try typing the URL directly instead', score: 0, feedback: 'great thinking — always navigate directly, never via suspicious links.' },
      { label: 'Log in but change my password after', score: 2, feedback: 'too late — the damage is done the moment you log in.' },
    ],
  },
]

export const BANDS = [
  { label: 'On Lock',        min: 0,  max: 12, color: '#007549', personality: "You're a Vault." },
  { label: 'Fast Lane',      min: 13, max: 24, color: '#5B5CF6', personality: "You're a Quick Check." },
  { label: 'Main Character', min: 25, max: 36, color: '#FF732E', personality: "You're an Open Book." },
  { label: 'Loose Link',     min: 37, max: 48, color: '#CC0000', personality: "You're a Wide Open Tab." },
]

export function getBand(scaledScore: number) {
  return BANDS.find((b) => scaledScore >= b.min && scaledScore <= b.max) ?? BANDS[3]
}

export function scaleScore(rawScore: number): number {
  return Math.round((rawScore / 30) * 48)
}
