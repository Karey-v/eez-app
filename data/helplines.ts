export type Helpline = {
  id: string
  name: string
  description: string
  contact: string
  contactType: 'phone' | 'website' | 'sms'
  available: string
}

export const helplines: Helpline[] = [
  {
    id: 'ftc',
    name: 'FTC Report Fraud',
    description: 'Report scams and fraud to the US Federal Trade Commission',
    contact: '1-877-382-4357',
    contactType: 'phone',
    available: 'Mon–Fri, 9am–8pm ET',
  },
  {
    id: 'fbi-ic3',
    name: 'FBI IC3',
    description: 'File an internet crime complaint with the FBI',
    contact: 'ic3.gov',
    contactType: 'website',
    available: '24/7 online',
  },
  {
    id: 'cfpb',
    name: 'CFPB',
    description: 'Consumer Financial Protection Bureau — bank and payment fraud',
    contact: '1-855-411-2372',
    contactType: 'phone',
    available: 'Mon–Fri, 8am–8pm ET',
  },
  {
    id: 'itrc',
    name: 'ITRC',
    description: 'Identity Theft Resource Center — identity fraud support',
    contact: '1-888-400-5530',
    contactType: 'phone',
    available: 'Mon–Fri, 6am–8pm PT',
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Free mental health support if fraud has affected you emotionally',
    contact: 'Text HOME to 741741',
    contactType: 'sms',
    available: '24/7',
  },
]
