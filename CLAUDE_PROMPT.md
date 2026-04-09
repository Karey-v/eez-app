# EEZ App — Claude Code Prototype Prompt

## What You're Building
**EEZ** is a mobile-first financial fraud awareness app for Gen Z (18–24).
This is a **prototype** — approximately 24 screens across 4 core flows.
The goal is to test the idea, not ship a product. Build real React Native (Expo),
not a web mockup. Nothing built here gets thrown away — it becomes the real app.

---

## Tech Stack
- **Framework:** React Native with Expo (managed workflow)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** StyleSheet API only — no Tailwind, no NativeWind
- **State:** Zustand (local only — no backend for prototype)
- **Fonts:** expo-google-fonts (DM Serif Display + Inter)
- **Icons:** react-native-svg (custom SVG line icons)
- **Animations:** React Native Reanimated 3

> No Supabase. No Anthropic API. No Google Maps. All data is local/mocked.

---

## Brand Rules (Non-Negotiable)

### Colors
```typescript
// /theme/colors.ts — the only place hex values live

export const brand = {
  purple:     '#602CFF',
  purpleCTA:  '#5B5CF6',
  orange:     '#FF732E',
  darkGreen:  '#007549',
  lime:       '#B1FF58',
  lavender:   '#D2D9FF',
}

export const light = {
  bgPrimary:    '#FFFFFF',
  bgSecondary:  '#F5F5F7',
  bgTertiary:   '#EBEBEB',
  textPrimary:  '#0A0A0A',
  textSecondary:'#5A5A5A',
  textTertiary: '#9A9A9A',
  borderWeak:   'rgba(0,0,0,0.15)',
  borderMid:    'rgba(0,0,0,0.30)',
  successBg:    '#E6F4EC',
  successText:  '#007549',
  warningBg:    '#FFF0E6',
  warningText:  '#FF732E',
  dangerBg:     '#FFE6E6',
  dangerText:   '#CC0000',
}

export const dark = {
  bgPrimary:    '#0A0A0A',
  bgSecondary:  '#1A1A1A',
  bgTertiary:   '#111111',
  textPrimary:  '#F5F5F5',
  textSecondary:'#AAAAAA',
  textTertiary: '#666666',
  borderWeak:   'rgba(255,255,255,0.15)',
  borderMid:    'rgba(255,255,255,0.30)',
  successBg:    '#0A2E1A',
  successText:  '#4ADE80',
  warningBg:    '#2E1800',
  warningText:  '#FB923C',
  dangerBg:     '#2E0000',
  dangerText:   '#F87171',
}
```

### Typography
- **Display font:** DM Serif Display — screen titles, score numbers, band labels, hero text
- **Body font:** Inter — all body copy, labels, buttons, inputs, everything else

```typescript
// /theme/typography.ts
export const type = {
  heroTitle:   { fontFamily: 'DMSerifDisplay', fontSize: 28, fontWeight: '400' },
  screenTitle: { fontFamily: 'DMSerifDisplay', fontSize: 22, fontWeight: '400' },
  sectionHead: { fontFamily: 'DMSerifDisplay', fontSize: 18, fontWeight: '400' },
  cardTitle:   { fontFamily: 'Inter', fontSize: 13, fontWeight: '700' },
  body:        { fontFamily: 'Inter', fontSize: 12, fontWeight: '400' },
  bodySmall:   { fontFamily: 'Inter', fontSize: 11, fontWeight: '400' },
  label:       { fontFamily: 'Inter', fontSize: 10, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  meta:        { fontFamily: 'Inter', fontSize: 9,  fontWeight: '600', letterSpacing: 1.0, textTransform: 'uppercase' },
}
```

### Spacing
```typescript
// /theme/spacing.ts
export const spacing = {
  screenH: 14,     // horizontal screen padding
  cardH: 14,       // card internal horizontal padding
  cardV: 12,       // card internal vertical padding
  cardGap: 6,      // gap between cards
  sectionTop: 8,
  sectionBottom: 4,
}
```

### Shapes & Surfaces
- Cards: `borderRadius: 14`, `borderWidth: 0.5`, border color `borderWeak`, bg `bgPrimary`
- Buttons: `borderRadius: 50` (pill), `minHeight: 44`
- Inputs: `borderRadius: 10`, `borderWidth: 0.5`, focused border `purpleCTA` 1px
- Chips: `borderRadius: 20`
- **No shadows. No gradients. No blur. Flat surfaces only.**

### Buttons
| Type | Background | Text | Border |
|------|-----------|------|--------|
| Primary purple | #5B5CF6 | white | none |
| Primary orange | #F4632A | white | none |
| Primary lime | #B8F04A | #1A4A00 | none |
| Outline | transparent | textPrimary | 1.5px borderMid |
| Ghost | none | textSecondary | none, underlined |

### Icons
- SVG line icons, stroke 2–2.5px, rounded linecaps
- Row/chip size: 14px | Card size: 18px | Header size: 24px

### Bottom Nav Bar
- 5 tabs: Home, Learn, Radar, Safety, Profile
- Active: filled icon + label at `#5B5CF6`, 4px dot below label
- Inactive: `textTertiary`, 0.6 opacity
- Top border: 0.5px `borderWeak`

---

## Project File Structure

```
/app
  /(auth)
    _layout.tsx
    splash.tsx              → S01 Splash
    welcome.tsx             → S03–05 Carousel
    sign-up.tsx             → S06 Sign Up
    sign-in.tsx             → S07 Sign In

  /(tabs)
    _layout.tsx             → Bottom nav
    index.tsx               → S10/S11 Home
    learn.tsx               → S32 Education Home (stub)
    radar.tsx               → S42 Radar Feed
    safety.tsx              → S48 Safety Home
    profile.tsx             → S55 Profile

  /leakability
    intro.tsx               → S12
    question.tsx            → S13–S22 (dynamic, type-driven)
    result.tsx              → S23
    breakdown.tsx           → S24

  /learn
    [moduleId]/index.tsx    → S33 Module Intro
    [moduleId]/lesson.tsx   → S34–S38 (type-driven)
    [moduleId]/complete.tsx → S39 Completion

  /radar
    incident/[id].tsx       → S44 Incident Detail
    report.tsx              → S51b Report Fraud (simplified)

  /safety
    detector.tsx            → S48b Detector Home
    chat.tsx                → S48c Detector Chat (mocked)
    helplines.tsx           → S49 Helplines (stub)
    guide/[scenario].tsx    → S51 Step-by-Step Guide

  /notifications
    index.tsx               → S52 Hub (stub)

  /profile
    badges.tsx              → S40 Badge Collection (stub)

/components
  /ui
    Button.tsx
    Card.tsx
    Input.tsx
    NavBar.tsx
    BottomSheet.tsx
    Toast.tsx
    Modal.tsx
    ProgressBar.tsx
    ScoreRing.tsx
    FraudScoreCard.tsx
    BadgeChip.tsx
  /icons
    Home.tsx, Learn.tsx, Radar.tsx, Safety.tsx, Profile.tsx
    Bell.tsx, Shield.tsx, Warning.tsx, Check.tsx, Arrow.tsx
    (all as SVG components)

/store
  userStore.ts      → name, score, band, badges, streak, moduleProgress
  testStore.ts      → current answers, category scores
  learnStore.ts     → completed modules, xp

/theme
  colors.ts
  typography.ts
  spacing.ts
  index.ts          → exports everything + useTheme hook

/data
  questions.ts      → all 10 test questions with scoring
  modules.ts        → module definitions + lesson content
  radarFeed.ts      → 8–10 mock incident cards
  helplines.ts      → helpline data
  badges.ts         → badge definitions
  chatResponses.ts  → mocked AI detector responses (3–4 scenarios)
```

---

## Prototype Scope — 24 Screens

### FLOW 1 — Onboarding & Auth (4 screens)
| Screen | ID | Notes |
|--------|-----|-------|
| Splash | S01 | 1.5s fade, purple bg, logo centered |
| Welcome carousel | S03–05 | 3 slides, swipeable, dot indicators |
| Sign Up | S06 | Form only — no real auth, stores name in Zustand |
| Sign In | S07 | Email + password fields — accepts anything, navigates home |

> No forgot password, no guest mode, no OAuth for prototype.
> Sign up just captures the user's name for personalization.

### FLOW 2 — Leakability Test (6 screens)
| Screen | ID | Notes |
|--------|-----|-------|
| Home — first time | S10 | Hero card with "take the test" CTA |
| Home — returning | S11 | Score card, band, quick actions |
| Test intro | S12 | Info chips, "Start" CTA |
| Questions | S13–S22 | Single dynamic screen, 4 question types |
| Score result | S23 | Animated count-up, band, personality |
| Breakdown | S24 | Category sub-scores, personalized path |

> All 10 questions fully built with real scoring logic.
> 4 question types: simulation-tap, slider, multiple-choice, scenario.
> Score saved to Zustand.

### FLOW 3 — Education (3 screens, 1 module)
| Screen | ID | Notes |
|--------|-----|-------|
| Module intro | S33 | Password Glow-Up module only |
| Lesson | S34–S38 | All 5 lesson types, dynamic screen |
| Completion | S39 | Badge earn, XP, confetti animation |

> Education home (S32) is a stub — shows the module card, rest locked.
> Badge collection (S40) is a stub — display only.
> No leaderboard in prototype.

### FLOW 4 — Safety Network (4 screens)
| Screen | ID | Notes |
|--------|-----|-------|
| Safety home | S48 | 3 scenario cards + AI detector card |
| Detector home | S48b | Quick-start prompts, input bar |
| Detector chat | S48c | Mocked responses, FraudScoreCard |
| Step-by-step guide | S51 | Post scenario only, fully interactive |

> AI responses are hardcoded — 3–4 realistic scenarios in /data/chatResponses.ts
> Helplines (S49) is a stub list screen — no phone dialer integration.
> Only "I was scammed" guide built fully. Other two scenarios show "coming soon."

### SUPPORTING SCREENS (stub/simplified)
| Screen | ID | Notes |
|--------|-----|-------|
| Radar feed | S42 | 8 static mock incident cards, filter chips (non-functional) |
| Incident detail | S44 | Full detail for 1–2 cards, rest use same template |
| Report fraud | S51b | Anonymous form only — submits to Zustand, shows on feed |
| Profile | S55 | Score, band, stats, badge shelf — no settings navigation |
| Notifications | S52 | Static list, unread styling — no detail screen |

---

## Build Order

### Phase 1 — Foundation (do this first, build nothing else)
1. `npx create-expo-app eez --template blank-typescript`
2. Install: `expo-router`, `zustand`, `react-native-reanimated`, `react-native-svg`, `@expo-google-fonts/dm-serif-display`, `@expo-google-fonts/inter`
3. Create `/theme/` — full colors, typography, spacing, `useTheme` hook
4. Create all shared UI components (Button, Card, Input, NavBar, ProgressBar, Toast)
5. Create all SVG icon components
6. Set up Zustand stores with initial state and actions
7. Populate all `/data/` files

**Do not build any screens until Phase 1 is complete.**

### Phase 2 — Auth Flow
Splash → Carousel → Sign Up → Sign In → Home (first-time state)

### Phase 3 — Leakability Test
Home → Test Intro → Questions (all 4 types) → Result → Breakdown → Home (returning state)

### Phase 4 — Education
Ed Home (stub) → Module Intro → Lessons (all 5 types) → Completion

### Phase 5 — Safety Network
Safety Home → Detector Home → Detector Chat → Guide (post scenario)

### Phase 6 — Radar + Report
Radar Feed → Incident Detail → Report Form

### Phase 7 — Polish
Profile stub, Notifications stub, navigation cleanup, transition animations, edge cases

---

## Key Data Structures

### Question (in /data/questions.ts)
```typescript
type QuestionType = 'simulation-tap' | 'slider' | 'multiple-choice' | 'scenario'

type Question = {
  id: number
  category: 'Impulse' | 'Habits' | 'Social Pressure' | 'Verification' | 'Response Style'
  type: QuestionType
  prompt: string
  simulation?: {        // for simulation-tap questions
    type: 'message' | 'email' | 'alert'
    content: string
    sender?: string
  }
  options?: {           // for tap/multiple-choice/scenario
    label: string
    score: number       // 0 (safest) to 3 (riskiest)
    feedback?: string   // shown after selection
  }[]
  sliderLabels?: {      // for slider questions
    left: string
    right: string
  }
}
```

### Scoring
```typescript
// 10 questions × max 3pts = 30 max
// Spec says 0–48 range (16 questions) — for prototype use 10 Qs, scale to 48
// scaled = Math.round((rawScore / 30) * 48)

const BANDS = [
  { label: 'On Lock',        min: 0,  max: 12, color: '#007549', personality: "You're a Vault." },
  { label: 'Fast Lane',      min: 13, max: 24, color: '#5B5CF6', personality: "You're a Quick Check." },
  { label: 'Main Character', min: 25, max: 36, color: '#FF732E', personality: "You're an Open Book." },
  { label: 'Loose Link',     min: 37, max: 48, color: '#CC0000', personality: "You're a Wide Open Tab." },
]
```

### Mocked AI Responses (in /data/chatResponses.ts)
```typescript
// Match against keywords in user input
// e.g. if input includes 'job' → return job scam response
// if input includes 'bank' → return phishing response
// default → return generic medium-risk response

type MockResponse = {
  trigger: string[]     // keywords that activate this response
  likelihood: number    // 0–100
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  redFlags: string[]
  looksOkay?: string[]
  whatToDoNext: string
  verifyYourself: string
}
```

---

## FraudScoreCard Component
This is the most important UI component in the prototype. Build it to spec.

```
┌─────────────────────────────────────────┐
│ fraud likelihood            ● HIGH RISK │
├─────────────────────────────────────────┤
│ ██████████████████░░░░  78%             │
├─────────────────────────────────────────┤
│ red flags detected                       │
│ ● sender domain mismatch                 │
│ ● urgency: "act now"                     │
│ ● password requested via message         │
├─────────────────────────────────────────┤
│ looks okay            (omit if none)     │
│ ✓ link uses HTTPS                        │
├─────────────────────────────────────────┤
│ what to do next                          │
│ Do not reply or click any links.         │
├─────────────────────────────────────────┤
│      [ go to step-by-step guide → ]      │
└─────────────────────────────────────────┘
```
Risk pill: LOW = successBg/successText, MEDIUM = warningBg/warningText, HIGH = dangerBg/dangerText
Bar fill color matches risk level. Animate bar fill on mount (300ms ease).

---

## Prototype Rules

1. **All data is local.** No API calls. No backend. Zustand is the database.
2. **Sign up/in is fake.** Accept any input, store name in Zustand, navigate home.
3. **AI responses are mocked.** Match keywords, return realistic pre-written responses.
4. **Radar feed is static.** 8 hardcoded incident cards in /data/radarFeed.ts.
5. **Report fraud saves locally.** Submitted reports prepend to the radar feed array in Zustand.
6. **Always use theme values.** Never hardcode a color, font size, or spacing value outside /theme/.
7. **Support dark mode from day one.** Use the useTheme hook on every screen.
8. **44px minimum touch targets.** Every pressable element.
9. **Test on a real device** (Expo Go) not just simulator.
10. **Nothing gets thrown away.** Architecture is production-ready. Only the data layer changes later.
