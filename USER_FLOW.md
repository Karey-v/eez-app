# EEZ — Prototype User Flow

## The 4 Testable Flows

```
FLOW 1          FLOW 2              FLOW 3          FLOW 4
Onboarding      Leakability Test    Education       Safety Network
─────────       ────────────────    ─────────       ──────────────
S01 Splash      S10/11 Home         S32 Ed Home*    S48 Safety Home
S03–05 Carousel S12 Test Intro      S33 Module Intro S48b Detector Home
S06 Sign Up     S13–22 Questions    S34–38 Lessons  S48c Detector Chat
S07 Sign In     S23 Result          S39 Completion  S51 Guide (post)
                S24 Breakdown

* stub — shows but limited interaction
```

---

## Flow 1 — Onboarding

```
[S01 Splash]
  1.5s fade animation, purple bg, EEZ logo
        │ auto-advance
        ▼
[S03–05 Welcome Carousel]
  Swipeable 3-slide
  Slide 1: "1 in 3 Gen Zers have been scammed online."
  Slide 2: "Your habits = your risk."
  Slide 3: "So... how leakable are you?" + CTA
        │
   ─────┴─────────────────
   │                     │
["Let's find out"]   [Skip / dot nav]
   │                     │
   ▼                     ▼ (same destination)
[S06 Sign Up]
  Name field (required for personalization)
  Email + password (fake auth, accept anything)
  "Sign up" → saves name to Zustand → Home
        │
  [already have account?]
        │
        ▼
[S07 Sign In]
  Email + password → accepts anything → Home
```

**Prototype simplifications:**
- No real auth — any input works
- No Google/Apple OAuth
- No forgot password flow
- Name from sign-up persists throughout ("hey maya.")

---

## Flow 2 — Leakability Test

```
[S10 Home — First Time]
  Hero: "so... how leakable are you?"
  CTA: "take the test"
        │
        ▼
[S12 Test Intro]
  "the leakability test."
  Chips: "5 mins" · "totally private" · "personalized results"
  CTA: "Start the test"
        │
        ▼
[Questions — dynamic screen, advances automatically]

  Q1  Simulation-tap   Impulse          Fake suspicious notification
  Q2  Slider           Habits           Password reuse behavior
  Q3  Simulation-tap   Social Pressure  "Can you help me log in?"
  Q4  Simulation-tap   Verification     Fake "update required" email
  Q5  Multiple-choice  Response Style   Unexpected thing online
  Q6  Multiple-choice  Habits           Public WiFi usage
  Q7  Simulation-tap   Impulse          "You've been selected!"
  Q8  Simulation-tap   Verification     "Contact support" message
  Q9  Simulation-tap   Social Pressure  Suspicious link from contact
  Q10 Multiple-choice  Response Style   Unexpected link behavior

  Each question:
  - Progress bar top: "1 of 10"
  - Category label below bar
  - Interaction (type-specific)
  - Simulation-tap: feedback shown 800ms → auto-advance
  - Slider: "Next →" appears after interaction
  - Multiple-choice: feedback shown 800ms → auto-advance
        │
        ▼ (after Q10)
[S23 Score Result]
  Count-up animation: 0 → [score] over 1.5s
  Band label fades in: e.g. "On Lock"
  Personality: "You're a Vault."
  Risk gauge (simple bar, not circular)
  3 CTAs:
    "See breakdown →" → S24
    "Start learning" → S32/S33
    "Share my score" → native share sheet
        │
  ["See breakdown →"]
        │
        ▼
[S24 Score Breakdown]
  5 category cards, each with:
    Category name
    Sub-score bar (filled proportionally)
    1-line insight (e.g. "strong on verification, watch impulse responses")
  Bottom: "your personalized path is ready."
  Module preview card (Passwords module)
  CTA: "Start learning now →" → S33
        │
        ▼
[S11 Home — Returning State]
  Score card with ring, band, "+X pts" if improved
  Quick actions row
  "Based on your score, start here →" module
```

**Scoring logic:**
```
Raw score: sum of all answer scores (0–3 per question)
Max raw: 30 (10 questions × 3)
Scaled: Math.round((raw / 30) * 48)

Band:
  0–12  → On Lock        (dark green)
  13–24 → Fast Lane      (purple)
  25–36 → Main Character (orange)
  37–48 → Loose Link     (red)

Category sub-scores:
  Each category has 2 questions → max 6 per category
  Display as percentage bar: (categoryScore / 6) * 100
```

---

## Flow 3 — Education (Password Module)

```
[S32 Education Home — stub]
  Learning path section:
    Card 1: "Password Glow-Up" → unlocked, "start" button
    Card 2: "Link & Message Hygiene" → locked
    Card 3: "Device Safety" → locked
  Streak: "🔥 1 day streak"
  Badges: 1 earned, rest greyed
  "Explore all modules" → same locked state
        │
  ["start" on Password Glow-Up]
        │
        ▼
[S33 Module Intro — Password Glow-Up]
  Title: "Password Glow-Up"
  Tag: "🔑 Passwords" · "⏱ 4 mins"
  What you'll learn:
    · The "Skeleton Key" trap
    · The "Passphrase" hack
    · Setting up your "Identity Armor"
  Difficulty: Beginner
  CTA: "Start module"
        │
        ▼
[S34 Lesson 1 — Text + Visual]
  "One key to rule them all? 🚩"
  Illustration: key icon tethered to app logos
  Body copy + EEZ Insight callout
  "Next →"
        │
        ▼
[S35 Lesson 2 — Swipe to Reveal]
  "Speed Dating... with a Scammer."
  Blurred panel: "How long to crack Password123?"
  Swipe → reveals: "Less than 1 second."
  Subtext explanation
  "Next →"
        │
        ▼
[S36 Lesson 3 — Tap to Uncover]
  "Build your Identity Armor."
  Passphrase displayed: Neon-Mango-Running-2026!
  3 tap hotspots → each reveals an explanation
  All 3 must be tapped before "Next →" appears
        │
        ▼
[S37 Lesson 4 — Scenario / Decision]
  "You have 40+ accounts. What do you do?"
  3 options with feedback:
    Notes app → 🚩 Red Flag
    Password manager → ✅ Pro Move
    Same base + digit → 🚩 Scammers know this
  "Next →" after selection
        │
        ▼
[S38 Lesson 5 — Quick Check]
  "What's the strongest second layer?"
  Options: SMS codes / Authenticator apps / Security questions
  Correct: Authenticator apps → micro-animation
  Incorrect: explanation shown
  "Finish →"
        │
        ▼
[S39 Module Completion]
  Confetti/particle animation
  Badge: "Password Pro" (large graphic)
  "+50 XP" animated counter
  "🔥 streak extended!"
  Summary: 3 bullets of what was learned
  CTAs:
    "Next module" → S33 (locked — "coming soon" state)
    "Back to learning home" → S32
```

---

## Flow 4 — Safety Network

```
[S48 Safety Home]
  Header: shield icon + "safety network."
  3 scenario cards:
    ⚠️  "I think I'm being scammed right now." → S51 active (stub "coming soon")
    ✓   "I was scammed — what do I do?" → S51 post scenario
    👥  "Someone I know needs help." → S51 other (stub "coming soon")
  AI Fraud Detector card:
    Green pulse dot (online indicator)
    "EEZ Fraud Detector"
    "upload a screenshot. we'll tell you if it's a scam."
    "try it now →" → S48b
  Emergency helplines mini-section:
    FTC · FBI IC3 · Crisis Text Line
    "see all helplines →" → S49 (stub)
        │
  [AI Detector card tap]
        │
        ▼
[S48b Detector Home]
  Header: back arrow + "EEZ Fraud Detector" + green dot
  Disclaimer banner (fixed, non-dismissible):
    "EEZ Fraud Detector is an AI assistant. Results are indicative only."
  Bot welcome bubble:
    "hey. i'm EEZ's fraud detector..."
  3 quick-start cards (horizontal scroll):
    📧 "check an email" → pre-fills input
    💼 "check a job offer" → pre-fills input
    💬 "suspicious message" → pre-fills input
  Input bar: text field + send button
        │
  [Type or tap quick-start → send]
        │
        ▼
[S48c Detector Chat]
  User message appears right-aligned
  Typing indicator (3-dot pulse, 1.5–2s)
  Bot response appears left-aligned
  FraudScoreCard renders below bot text:
    ┌──────────────────────────────────┐
    │ fraud likelihood    ● HIGH RISK  │
    │ ████████████░░░░░░  78%          │
    │ red flags detected               │
    │ · sender domain mismatch         │
    │ · urgency language               │
    │ looks okay                       │
    │ ✓ link uses HTTPS                │
    │ what to do next                  │
    │ Do not click or reply.           │
    │ [go to step-by-step guide →]     │
    └──────────────────────────────────┘
  User can send follow-up messages
  Each new message gets a mocked response from /data/chatResponses.ts

  Mock response matching logic:
    'job' or 'offer' or 'hired'  → Job scam response (HIGH, 82%)
    'bank' or 'account' or 'suspend' → Phishing response (HIGH, 91%)
    'prize' or 'won' or 'claim'  → Lottery scam response (HIGH, 88%)
    'friend' or 'link' or 'check' → Social engineering (MEDIUM, 54%)
    anything else                 → Generic response (MEDIUM, 61%)
        │
  ["go to step-by-step guide →" on HIGH RISK card]
        │
        ▼
[S51 Step-by-Step Guide — POST scenario]
  Header: "you're not alone. here's what to do next."
  Progress: "Step 0 of 6" → advances as steps checked
  Progress bar fills proportionally

  Step 1: Secure your accounts
    Explanation text
    Checkbox → marks complete
  Step 2: Check your credit
    Explanation + "Check your credit →" button (opens URL)
    Checkbox
  Step 3: Freeze your credit
    Explanation + "Freeze your credit →" button → S49
    Checkbox
  Step 4: File FTC report
    Explanation + "Report to FTC →" button (opens URL)
    Checkbox
  Step 5: FBI IC3
    Explanation + "File with FBI IC3 →" button (opens URL)
    Checkbox
  Step 6: Talk to someone
    Explanation + "Text HOME to 741741" button (opens SMS)
    Checkbox

  All 6 checked → End state card appears:
    "fraud recovery takes time. every step you take matters."
    Links: "see all helplines" → S49 | "talk to the fraud detector" → S48b
```

---

## Supporting Screens

### Radar Feed (S42)
```
[S42 Radar Feed — static]
  Header: "radar." + blinking dot
  Search bar (non-functional in prototype)
  Filter chips: All · Banks · Jobs · Payments · Identity (non-functional)
  
  8 static incident cards from /data/radarFeed.ts:
    Each card:
      Category tag (color-coded)
      Headline (short, natural tone)
      Location + timestamp
      2–3 line preview text
      Engagement row: ▲ upvote · 💬 comment · 👁 seen this
    
    Tap card → S44 Incident Detail (2 cards fully built, rest use template)
  
  Every 5–6 cards: "avoided" card variant (green tag)
  
  FAB: "report something?" → S51b Report Fraud
```

### Incident Detail (S44)
```
  Full card expansion:
    Category tag + verified badge (if applicable)
    Full description in natural voice
    Structured breakdown:
      How it happened (bullet list)
      Red flags (bullet list)
      Tactic used
    Confidence indicator
    Engagement row
    2 related incident cards (same template)
```

### Report Fraud (S51b — simplified)
```
[S51b Report Fraud]
  Header: "report it."
  Subtitle: "reporting fraud helps protect the next person."

  Section: "add to our radar"
  Description: "share what happened (anonymously)"

  Form:
    Incident type dropdown:
      Phishing / Job Scam / Romance Scam / 
      Data Breach / Fake Transaction / Other
    Description textarea (280 char limit, counter shown)
    Location: text field (city name only)
    Consent checkbox: "I confirm this is genuine"

  Submit button:
    Inactive until: type selected + 20+ chars + checkbox checked
    On submit → prepends to radarFeed in Zustand
             → navigate to S42 with toast "your report is live on radar."

  No official channels section in prototype (FTC/FBI links only, no built cards)
```

### Profile (S55 — stub)
```
[S55 Profile — minimal]
  Avatar circle (initials)
  Display name
  "member since April 2026"
  Band badge

  Stats row:
    Leak score | Modules | Badges | Streak

  Badge shelf (horizontal):
    1 earned badge (Password Pro if module complete, else On Lock band badge)
    4 locked badges (greyed)

  Settings list rows (visual only — no navigation in prototype):
    edit profile ›
    score history ›
    badges & achievements ›
    notification preferences ›
    privacy & data ›
    log out (tappable — clears Zustand, returns to S07)
```

### Notifications (S52 — stub)
```
[S52 Notifications — static]
  "Today" section:
    Score update (unread, green dot)
    "new incident near you" (unread, orange dot)
  "Earlier" section:
    "1 module away from your next badge" (read)
    "your weekly EEZ digest is ready" (read)

  Tap any row → marks as read (removes dot, removes tint)
  No detail screen in prototype
```

### Helplines (S49 — stub)
```
[S49 Helplines — display only]
  Listed helplines, no phone dialer integration:
    FTC Report Fraud — 1-877-382-4357
    FBI IC3 — ic3.gov
    CFPB — 1-855-411-2372
    ITRC — 1-888-400-5530
    Crisis Text Line — Text HOME to 741741
  Copy button copies number (clipboard only)
  No outbound calls or SMS in prototype
```

---

## Navigation Map

```
Bottom nav always visible on main tabs

Home ──────────── Leakability Test ─────── Education
 │                      │                      │
 │    ┌─────────────────┘                      │
 │    │                                        │
 ▼    ▼                                        ▼
S10/11 ──["take test"]──► S12 ──► S13–22 ──► S23 ──► S24
  ▲                                                     │
  └─────────────────────────────────────────────────────┘
                                         ["start learning"]
                                                  │
                                                  ▼
                                          S32 ──► S33 ──► S34–38 ──► S39
                                                                       │
                                                              ["back to learning"]
                                                                       │
                                                                      S32

Safety ──► S48 ──► S48b ──► S48c ──► S51 (post)
                                       │
                           ["see helplines"] ──► S49

Radar ──► S42 ──► S44 (incident detail)
            │
           FAB ──► S51b (report) ──► S42 (with toast)

Profile ──► S55 ──► ["log out"] ──► S07
```

---

## State That Persists (Zustand)

```typescript
// userStore
{
  name: string
  isSignedIn: boolean
  score: number | null          // null = hasn't taken test
  band: string | null
  categoryScores: {
    impulse: number
    habits: number
    socialPressure: number
    verification: number
    responseStyle: number
  }
  xp: number
  streak: number
  badges: string[]              // badge ids earned
  lastTestDate: string | null
}

// learnStore
{
  completedModules: string[]    // module ids
  currentModule: string | null
  currentLesson: number         // lesson index within module
}

// radarStore
{
  feed: IncidentCard[]          // starts with /data/radarFeed.ts, prepends on report
  upvoted: string[]             // incident ids the user upvoted
}
```

---

## Error States (Prototype)

| Scenario | Behavior |
|----------|----------|
| Sign up with empty name | Inline error: "we need your name to personalize your experience" |
| Test question unanswered | "Next" button stays inactive |
| Report submitted without consent | Submit button stays inactive |
| Module accessed while locked | Toast: "finish the previous module to unlock this one" |
| All chat inputs | Always returns a mocked response — no error state needed |
