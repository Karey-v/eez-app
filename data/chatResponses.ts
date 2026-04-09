export type MockResponse = {
  triggers: string[]
  likelihood: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  botMessage: string
  redFlags: string[]
  looksOkay?: string[]
  whatToDoNext: string
  verifyYourself: string
  showGuideButton: boolean
}

export const chatResponses: MockResponse[] = [
  {
    triggers: ['job', 'offer', 'hired', 'recruiter', 'salary', 'remote', 'work from home', 'position'],
    likelihood: 82,
    level: 'HIGH',
    botMessage: "that looks like a job scam to me. here's what i found.",
    redFlags: [
      'Unsolicited job offer — you didn\'t apply',
      'Crypto or gift card payment requested',
      'Interview conducted only via text/WhatsApp',
      'Salary unrealistically high for role',
    ],
    looksOkay: ['Company name exists online'],
    whatToDoNext: 'Do not proceed. Do not pay any fees or share personal documents. Legitimate employers never ask for payment or crypto wallets upfront.',
    verifyYourself: 'Search the company on Companies House. Call their official number found via Google — not the number they gave you.',
    showGuideButton: true,
  },
  {
    triggers: ['bank', 'account', 'suspend', 'barclays', 'lloyds', 'hsbc', 'natwest', 'fraud team', 'safe account', 'transfer'],
    likelihood: 91,
    level: 'HIGH',
    botMessage: "this has all the signs of a bank impersonation scam. don't ignore this.",
    redFlags: [
      'Caller/sender claiming to be your bank',
      '"Safe account" transfer requested',
      'Urgency to act immediately',
      'Knows partial personal details (to seem legitimate)',
    ],
    whatToDoNext: 'Hang up or stop replying. Call your bank directly using the number on the back of your card. Your bank will never ask you to move money.',
    verifyYourself: 'Check your bank\'s official website for the fraud helpline number. In the UK, call 159 to reach your bank\'s fraud team directly.',
    showGuideButton: true,
  },
  {
    triggers: ['prize', 'won', 'claim', 'giveaway', 'selected', 'winner', 'reward', 'gift card'],
    likelihood: 88,
    level: 'HIGH',
    botMessage: "this screams lottery scam. here's why.",
    redFlags: [
      'You never entered this competition',
      'Requires upfront fee to claim prize',
      'Time pressure to claim immediately',
      'Asks for personal info to "verify" winner',
    ],
    looksOkay: ['Message uses your name'],
    whatToDoNext: 'Do not pay any "processing" or "release" fee. Do not share your bank details. Real prizes don\'t require you to pay to receive them.',
    verifyYourself: 'Search "[brand name] lottery scam" — if it\'s fake, others will have reported it.',
    showGuideButton: true,
  },
  {
    triggers: ['friend', 'link', 'check', 'message', 'sent me', 'dm', 'instagram', 'whatsapp', 'contact'],
    likelihood: 54,
    level: 'MEDIUM',
    botMessage: "this could be social engineering — worth being careful here.",
    redFlags: [
      'Unusual request from a known contact',
      'Link sent without context',
      'Account may have been compromised',
    ],
    looksOkay: ['Came from a familiar contact', 'No immediate payment request'],
    whatToDoNext: 'Don\'t click the link yet. Message your friend via a different channel (phone call or different app) to confirm they actually sent it.',
    verifyYourself: 'Call or video call the person. If their account is compromised, a voice call will usually reveal it.',
    showGuideButton: false,
  },
]

export const defaultResponse: MockResponse = {
  triggers: [],
  likelihood: 61,
  level: 'MEDIUM',
  botMessage: "i can\'t be certain, but there are some things here worth watching.",
  redFlags: [
    'Unsolicited contact from unknown source',
    'Requests personal information',
    'Something feels off',
  ],
  looksOkay: ['No immediate payment request'],
  whatToDoNext: 'Don\'t share any personal information or click any links until you\'ve verified who you\'re dealing with. Take your time — scammers create urgency to stop you thinking clearly.',
  verifyYourself: 'Search the sender\'s name, phone number, or email address online. Scam reports often appear quickly on Google.',
  showGuideButton: false,
}

export function getResponse(input: string): MockResponse {
  const lower = input.toLowerCase()
  for (const response of chatResponses) {
    if (response.triggers.some((trigger) => lower.includes(trigger))) {
      return response
    }
  }
  return defaultResponse
}
