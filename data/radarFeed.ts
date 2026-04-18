export type IncidentCard = {
  id: string
  category: 'Banks' | 'Jobs' | 'Payments' | 'Identity' | 'Phishing'
  variant: 'incident' | 'avoided'
  headline: string
  location: string
  timestamp: string
  preview: string
  upvotes: number
  comments: number
  verified: boolean
  redFlags?: string[]
  tactic?: string
}

export const radarFeed: IncidentCard[] = [
  {
    id: '1',
    category: 'Phishing',
    variant: 'incident',
    headline: 'fake apple support email almost got me',
    location: 'Manhattan, NY',
    timestamp: '2h ago',
    preview: 'Got an email saying my iCloud was locked. The design looked identical to Apple\'s. Only noticed the domain was "appleID-secure.net" after I nearly clicked the link.',
    upvotes: 142,
    comments: 23,
    verified: true,
    redFlags: ['Fake sender domain', 'Urgency language', 'Link to non-apple.com URL'],
    tactic: 'Brand impersonation phishing',
  },
  {
    id: '2',
    category: 'Jobs',
    variant: 'incident',
    headline: 'job offer on linkedin turned into a crypto trap',
    location: 'Brooklyn, NY',
    timestamp: '5h ago',
    preview: 'A recruiter from "Meta" reached out for a remote role. After a fake interview, they asked me to set up a crypto wallet to receive my "signing bonus". Lost £200 before I figured it out.',
    upvotes: 287,
    comments: 41,
    verified: true,
    redFlags: ['Unsolicited approach', 'Crypto payment requested', 'No company verification'],
    tactic: 'Pig butchering / job scam hybrid',
  },
  {
    id: '3',
    category: 'Banks',
    variant: 'avoided',
    headline: 'spotted the fake "HMRC refund" text before clicking',
    location: 'Queens, NY',
    timestamp: '1d ago',
    preview: 'Received a text claiming I had an unclaimed tax refund of £348. The link looked legit but I Googled the number first — HMRC never contacts you via text for refunds.',
    upvotes: 98,
    comments: 12,
    verified: false,
    redFlags: ['Unsolicited refund claim', 'Link via text', 'Urgency to claim'],
    tactic: 'Government impersonation SMS phishing',
  },
  {
    id: '4',
    category: 'Identity',
    variant: 'incident',
    headline: 'my instagram got hacked after a "brand deal"',
    location: 'Bronx, NY',
    timestamp: '2d ago',
    preview: 'A brand messaged me for a collab. They asked me to "verify" my creator account via a link. Within an hour my account was taken over and posting scam content.',
    upvotes: 334,
    comments: 67,
    verified: true,
    redFlags: ['Unsolicited brand deal', 'Verification link request', 'No official platform contact'],
    tactic: 'Account takeover via phishing link',
  },
  {
    id: '5',
    category: 'Payments',
    variant: 'incident',
    headline: 'sent £500 via bank transfer for a ps5 that never arrived',
    location: 'Jersey City, NJ',
    timestamp: '3d ago',
    preview: 'Found a PS5 on Facebook Marketplace, priced just under retail. Seller pushed for bank transfer over PayPal. Transferred the money — seller disappeared immediately.',
    upvotes: 201,
    comments: 38,
    verified: true,
    redFlags: ['Below-market price', 'Push for bank transfer', 'No buyer protection'],
    tactic: 'Marketplace payment fraud',
  },
  {
    id: '6',
    category: 'Banks',
    variant: 'incident',
    headline: '"fraud team" called and emptied my account',
    location: 'Harlem, NY',
    timestamp: '4d ago',
    preview: 'Someone called claiming to be from Barclays fraud team. They knew my name and last 4 card digits. They told me my account was compromised and I needed to move money to a "safe account". I did. There is no safe account.',
    upvotes: 512,
    comments: 89,
    verified: true,
    redFlags: ['Unexpected call', 'Safe account request', 'Urgency pressure'],
    tactic: 'Authorised push payment (APP) fraud',
  },
  {
    id: '7',
    category: 'Jobs',
    variant: 'avoided',
    headline: 'almost fell for a fake internship at a "startup"',
    location: 'Astoria, NY',
    timestamp: '5d ago',
    preview: 'Applied to a well-designed job listing on Indeed. The "company" had a professional website but I couldn\'t find them on Companies House. Asked them to verify — they ghosted me.',
    upvotes: 76,
    comments: 9,
    verified: false,
    redFlags: ['No Companies House record', 'Only email contact', 'Too-good salary for intern role'],
    tactic: 'Fake employer data harvesting',
  },
  {
    id: '8',
    category: 'Phishing',
    variant: 'incident',
    headline: 'dodgy parcel text stole my card details',
    location: 'Long Island City, NY',
    timestamp: '1w ago',
    preview: 'Got an Evri text saying my parcel was held due to unpaid customs. Paid the £2.99 "fee" on what looked like the Evri site. Later saw multiple £49.99 charges — it was a subscription scam.',
    upvotes: 445,
    comments: 72,
    verified: true,
    redFlags: ['Unsolicited delivery text', 'Small fee to unlock', 'Cloned brand website'],
    tactic: 'Parcel delivery phishing + recurring charge',
  },
]
