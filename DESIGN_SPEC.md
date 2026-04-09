# EEZ — Design Specification (Prototype)

## 1. Brand Identity

**App Name:** EEZ
**Tagline:** How leakable are you?
**Audience:** Gen Z, ages 18–24
**Tone:** Direct, honest, non-judgmental, slightly dry — like a smart friend who happens to know about fraud
**Platform:** iOS + Android (React Native / Expo)

---

## 2. Color System

### Brand Accents — the only 5 accent colors used anywhere
| Name | Hex | Usage |
|------|-----|-------|
| Purple | #602CFF | Brand, hero backgrounds, splash |
| Purple CTA | #5B5CF6 | Primary buttons, active nav, rings, focus borders |
| Orange | #FF732E | Warnings, secondary CTAs, Main Character band |
| Dark Green | #007549 | Success, On Lock band |
| Lime | #B1FF58 | Positive highlights, lime CTA variant |
| Lavender | #D2D9FF | Soft chips, secondary tags |

### System Colors (theme object — both modes required)
```typescript
export const light = {
  bgPrimary:     '#FFFFFF',
  bgSecondary:   '#F5F5F7',
  bgTertiary:    '#EBEBEB',
  textPrimary:   '#0A0A0A',
  textSecondary: '#5A5A5A',
  textTertiary:  '#9A9A9A',
  borderWeak:    'rgba(0,0,0,0.15)',
  borderMid:     'rgba(0,0,0,0.30)',
  successBg:     '#E6F4EC',
  successText:   '#007549',
  warningBg:     '#FFF0E6',
  warningText:   '#FF732E',
  dangerBg:      '#FFE6E6',
  dangerText:    '#CC0000',
}

export const dark = {
  bgPrimary:     '#0A0A0A',
  bgSecondary:   '#1A1A1A',
  bgTertiary:    '#111111',
  textPrimary:   '#F5F5F5',
  textSecondary: '#AAAAAA',
  textTertiary:  '#666666',
  borderWeak:    'rgba(255,255,255,0.15)',
  borderMid:     'rgba(255,255,255,0.30)',
  successBg:     '#0A2E1A',
  successText:   '#4ADE80',
  warningBg:     '#2E1800',
  warningText:   '#FB923C',
  dangerBg:      '#2E0000',
  dangerText:    '#F87171',
}
```

### Text on Brand Color Backgrounds
| Background | Primary Text | Secondary Text |
|-----------|-------------|----------------|
| Purple #602CFF | #FFFFFF | #C8C8FF |
| Purple CTA #5B5CF6 | #FFFFFF | #C8C8FF |
| Orange #FF732E | #FFFFFF | #5C1800 |
| Dark Green #007549 | #FFFFFF | #9FE8C4 |
| Lime #B1FF58 | #1A4A00 | #2D6A00 |
| Lavender #D2D9FF | #0A0A0A | #5A5A5A |

---

## 3. Typography

### Fonts
- **DM Serif Display** — all screen titles, hero text, score numbers, band labels
- **Inter** — all body copy, labels, buttons, inputs, chips, timestamps

### Scale
| Role | Font | Size | Weight | Case | Spacing |
|------|------|------|--------|------|---------|
| Hero title | DM Serif Display | 28px | 400 | lowercase | — |
| Screen title | DM Serif Display | 22px | 400 | lowercase | — |
| Section heading | DM Serif Display | 18px | 400 | — | — |
| Card title | Inter | 13px | 700 | — | — |
| Body | Inter | 12px | 400 | — | — |
| Body small | Inter | 11px | 400 | — | — |
| Chip / label | Inter | 10px | 600 | UPPERCASE | 0.06em |
| Timestamp / meta | Inter | 9px | 600 | UPPERCASE | 0.10em |
| **Minimum** | — | **9px** | — | — | — |

> DM Serif Display is a display weight — it renders at 400 and still reads as bold at large sizes. Do not use fontWeight 700 with it.

---

## 4. Spacing

```typescript
export const spacing = {
  screenH:      14,   // left/right padding on every screen
  cardH:        14,   // card horizontal internal padding
  cardV:        12,   // card vertical internal padding
  cardGap:       6,   // vertical gap between stacked cards
  sectionTop:    8,   // margin above section label
  sectionBottom: 4,   // margin below section label
  inputV:        9,   // input vertical padding
  inputH:       12,   // input horizontal padding
}
```

---

## 5. Component Specs

### Card
```
backgroundColor: bgPrimary
borderRadius: 14–16
borderWidth: 0.5
borderColor: borderWeak
padding: cardV cardH
NO shadows, NO gradients
```
Brand-color cards (score band, AI detector, hero): use brand color as backgroundColor, no border.

### Buttons
```
All buttons:
  borderRadius: 50       (pill)
  minHeight: 44
  paddingHorizontal: 20
  fontFamily: Inter
  fontSize: 12
  fontWeight: '700'

Primary purple:
  backgroundColor: '#5B5CF6'
  color: '#FFFFFF'

Primary orange:
  backgroundColor: '#F4632A'
  color: '#FFFFFF'

Primary lime:
  backgroundColor: '#B8F04A'
  color: '#1A4A00'

Outline:
  backgroundColor: 'transparent'
  borderWidth: 1.5
  borderColor: borderMid
  color: textPrimary

Ghost:
  backgroundColor: 'transparent'
  color: textSecondary
  textDecorationLine: 'underline'
```

### Input Fields
```
backgroundColor: bgSecondary
borderRadius: 10–12
borderWidth: 0.5
borderColor: borderWeak
paddingVertical: 9
paddingHorizontal: 12
fontFamily: Inter
fontSize: 12
color: textPrimary
placeholderTextColor: textTertiary

Focused:
  borderWidth: 1
  borderColor: '#5B5CF6'
```

### Bottom Navigation Bar
```
height: 56 + SafeAreaInsets.bottom
backgroundColor: bgPrimary
borderTopWidth: 0.5
borderTopColor: borderWeak

Each tab:
  icon: SVG 20px, stroke 2px
  label: Inter 9px 600 UPPERCASE

Active:
  iconColor: '#5B5CF6'
  labelColor: '#5B5CF6'
  4px dot below label, color '#5B5CF6'

Inactive:
  iconColor: textTertiary
  labelColor: textTertiary
  opacity: 0.6
```

### Chips / Category Tags
```
borderRadius: 20
paddingVertical: 4
paddingHorizontal: 10
fontFamily: Inter
fontSize: 10
fontWeight: '600'
textTransform: 'uppercase'
letterSpacing: 0.6
```

### Score Band Badges (pill label on cards)
```
On Lock:      bg '#007549', text '#FFFFFF'
Fast Lane:    bg '#5B5CF6', text '#FFFFFF'
Main Character: bg '#FF732E', text '#FFFFFF'
Loose Link:   bg '#CC0000', text '#FFFFFF'
borderRadius: 20
paddingVertical: 3
paddingHorizontal: 10
```

### Modals
```
Overlay: rgba(0,0,0,0.45), covers full screen
Card:
  backgroundColor: bgPrimary
  borderRadius: 16
  padding: 20
  marginHorizontal: 24

Dismissible by overlay tap: informational only
NOT dismissible by overlay: delete, log out actions
```

### Toast
```
Position: bottom, above nav bar, 12px margin
backgroundColor: bgSecondary
borderRadius: 20
paddingVertical: 10
paddingHorizontal: 16
fontFamily: Inter, 12px
Slide up on appear, slide down after 2.5s

Confirm: small green checkmark icon left
Warning: small orange warning icon left
```

### Bottom Sheet
```
Slides up from bottom
backgroundColor: bgPrimary
borderTopLeftRadius: 20
borderTopRightRadius: 20
Handle: 40×4px, borderRadius 2, borderWeak color, centered, 8px top margin
Overlay: rgba(0,0,0,0.35)
Dismisses on overlay tap or swipe down
```

### Icons
```
All SVG line icons
strokeWidth: 2–2.5
strokeLinecap: round
strokeLinejoin: round
fill: none (unless explicitly filled for active states)

Sizes:
  In list rows and chips: 14px
  In cards and tiles: 18px
  In headers and hero sections: 24px max

Color: inherit from context
  On colored bg: white or light shade of same family
  On light bg: textPrimary or textSecondary
```

---

## 6. Screen-Specific Notes

### S01 Splash
- Background: #602CFF
- Logo: centered, white
- Fade in 400ms, hold 1s, fade out 300ms → navigate
- No status bar text visible (use dark content hidden on purple)

### S03–05 Carousel
- White background
- Headline: DM Serif Display 28px, lowercase
- Dots: 6px circles, active = #5B5CF6 filled, inactive = borderWeak
- Swipe cue: small chevron right, textTertiary
- Skip button: top right, ghost style

### S10 Home (first time)
- Top bar: EEZ logo left, bell icon right
- Hero card: purple background (#602CFF), white text
  - "so... how leakable are you?" (DM Serif 22px)
  - CTA button: lime (#B8F04A) with dark green text
- 3-icon row: equal columns, icon 24px, label 10px Inter 600

### S11 Home (returning)
- "hey [name]." — DM Serif 28px, lowercase
- Score card: band color as background
  - Score number: DM Serif 48px
  - Band label: Inter 12px 600 UPPERCASE
  - "+X pts" in small chip if improved
- Quick actions: horizontal scroll, card style

### S12 Test Intro
- Info chips: lavender background (#D2D9FF), dark text
- "totally private" chip gets a small lock icon

### S13–22 Questions
- Progress bar: thin, 2px height, bgSecondary track, #5B5CF6 fill
- Category label: Inter 10px 600 UPPERCASE, textTertiary
- Simulation UI (fake message/email): bgSecondary card, slightly inset
  - Sender avatar: initials circle, 32px
  - Looks like a real notification or message
- Option buttons: outline style, full width, left-aligned text
- Selected: border becomes #5B5CF6, slight bgSecondary tint
- Feedback (simulation questions): small colored text below selection
  - Correct/safer: successText
  - Risky: warningText or dangerText

### S23 Score Result
- Score: DM Serif Display 72px, band color
- Count-up: use Reanimated 3 shared value, 1.5s ease-out
- Band label: Inter 14px 700 UPPERCASE, band color
- Risk gauge: full-width bar, 8px height, rounded
  - Track: bgSecondary
  - Fill: gradient from successText → dangerText
  - Indicator: 16px circle at score position, band color

### S24 Breakdown
- Category card: no brand color — use bgPrimary with border
- Sub-score bar: 6px height, bgTertiary track, band color fill
- Animate all bars on mount (staggered, 200ms delay per card)

### S33 Module Intro
- Purple accent strip at top (not full background)
- Key icon: 48px, purple
- Bullet list: Inter 12px, checkmark in purple

### S34–38 Lessons
- Lesson type indicator: small chip top right
- Progress dots (not bar): one dot per lesson, filled = complete
- S35 Swipe reveal: blurred overlay (8px blur on a view, not CSS)
- S36 Tap hotspots: pulsing circles (scale animation, 2s loop, subtle)
- S37 Feedback: card expands below selected option with colored left border
  - 🚩 Red Flag: dangerBg background, dangerText
  - ✅ Pro Move: successBg background, successText

### S39 Completion
- Full screen: bgPrimary (not colored background)
- Confetti: use react-native-confetti-cannon or simple particle animation
- Badge: 80px circle with icon, surrounded by glow ring (purple, 0.2 opacity)
- XP counter: count up from 0 to 50, DM Serif 48px, #5B5CF6

### S48 Safety Home
- Shield icon in header: 24px, #5B5CF6
- Scenario card icons: 20px circles with brand color fill
  - Active scam: orange circle, warning icon
  - Post scam: green circle, checkmark icon
  - Help someone: purple circle, people icon
- AI Detector card: dark green (#007549) background
  - All text: white / #9FE8C4
  - Pulse dot: 8px, #B1FF58, scale animation 1→1.4→1, 2s loop

### S48b Detector Home
- Disclaimer banner: bgSecondary, 10px Inter, borderBottom 0.5px
- Bot bubble: left-aligned, bgSecondary, borderRadius 0 12 12 12
- Quick-start cards: horizontal scroll, smaller cards (120px wide)
- Input bar: borderTop 0.5px borderWeak, bgPrimary

### S48c Detector Chat
- User bubble: right-aligned, #5B5CF6 background, white text, borderRadius 12 0 12 12
- Bot bubble: left-aligned, bgSecondary, textPrimary, borderRadius 0 12 12 12
- Typing indicator: 3 dots, each scales 1→1.3→1, staggered 200ms
- FraudScoreCard: renders as a card below the bot bubble, not inside it

### FraudScoreCard (critical — build this carefully)
```
Card:
  backgroundColor: bgSecondary
  borderRadius: 14
  borderWidth: 0.5
  borderColor: borderWeak
  padding: 12

Header row:
  Left: "fraud likelihood" — Inter 9px 600 UPPERCASE textTertiary
  Right: risk pill
    LOW RISK:    successBg bg, successText text
    MEDIUM RISK: warningBg bg, warningText text
    HIGH RISK:   dangerBg bg, dangerText text
    borderRadius: 20, paddingH: 8, paddingV: 3

Score bar:
  marginTop: 10
  height: 6
  borderRadius: 3
  backgroundColor: bgTertiary
  Fill view: width = `${likelihood}%`, same color as risk pill text
  Percentage: Inter 11px 700, right of bar
  Animate width on mount: 300ms ease

Red flags section:
  Label: "red flags detected" — Inter 9px 600 UPPERCASE textTertiary
  Each flag: row with 6px red circle left + Inter 11px textPrimary
  Separator: 0.5px borderWeak between header and flags

Looks okay section (omit entirely if empty):
  Label: "looks okay"
  Each: row with 6px green circle left + Inter 11px

What to do next:
  Label: "what to do next" — UPPERCASE
  Text: Inter 12px textPrimary

Action button (only for HIGH risk):
  Outline style, full width, "go to step-by-step guide →"
```

### S51 Step-by-Step Guide
- Progress bar: same as test questions
- Step card: bgPrimary, border, 14px radius
  - Step number: 28px circle, bgSecondary, Inter 12px 700
  - Checkbox: 24px, unchecked = borderWeak border, checked = #5B5CF6 fill + white checkmark
- Action buttons inside cards: outline style, smaller padding
- End state card: bgSecondary, centered text, no border

### S42 Radar Feed
- Category tags: color-coded
  - Banks: #5B5CF6 bg, white text
  - Jobs: orange bg, white text
  - Payments: dark green bg, white text
  - Identity: red bg, white text
  - Phishing: purple bg, white text
- "avoided" card variant: lime bg tag instead
- Engagement row: Inter 10px, textTertiary, icons 12px

### S51b Report Form
- Dropdown: same style as input field, chevron right
- Textarea: same as input but multiline, min 100px height
- Character counter: right-aligned below textarea, textTertiary
- Consent checkbox: 20px, same as step guide checkbox style
- Submit button: inactive state = reduced opacity (0.4), not disabled color

### S55 Profile
- Avatar circle: 72px, #5B5CF6 background, white initials, DM Serif 28px
- Stats row: 4 equal boxes, bgSecondary, borderRadius 12, no border
  - Number: DM Serif 24px, textPrimary
  - Label: Inter 9px 600 UPPERCASE textTertiary
- Badge shelf: 40px circles, earned = full color, locked = bgSecondary + lock icon
- Settings rows: 48px height, chevron right, borderBottom 0.5px borderWeak

---

## 7. Motion & Transitions

| Element | Type | Duration | Notes |
|---------|------|----------|-------|
| Screen push | Horizontal slide | Native default | Expo Router default |
| Modal | Fade in/out | 200ms | |
| Bottom sheet | Slide up/down | 300ms | |
| Toast | Slide up/down | 250ms | |
| Toggle | Color transition | 150ms | |
| Progress bar fill | Width ease | 300ms | |
| Score count-up | Reanimated shared value | 1500ms | ease-out |
| Score bar fill | Width ease | 800ms | delay 200ms after count-up |
| Category bars | Width ease, staggered | 300ms | 100ms delay per card |
| Typing indicator | Scale pulse | 600ms loop | 3 dots, 200ms stagger |
| Lesson hotspots | Scale pulse | 2000ms loop | subtle, 1→1.15→1 |
| Completion confetti | Particle burst | 2000ms | trigger on mount |
| XP counter | Count-up | 800ms | |
| AI detector pulse dot | Scale | 2000ms loop | 1→1.4→1 |
| Question feedback | Fade in | 200ms | |
| All other | None | — | No parallax, no physics |

---

## 8. Accessibility

- All pressable elements: minimum 44×44px touch target
- Text contrast: WCAG AA minimum (4.5:1 for body, 3:1 for large text)
- All icons: accessibilityLabel prop
- Form fields: label as separate Text element above input (not placeholder only)
- No information conveyed by color alone (always pair with text or icon)
- Dynamic type: use sp units via Expo's PixelRatio where critical

---

## 9. useTheme Hook Pattern

```typescript
// /theme/index.ts
import { useColorScheme } from 'react-native'
import { light, dark, brand } from './colors'
import { type } from './typography'
import { spacing } from './spacing'

export function useTheme() {
  const scheme = useColorScheme()
  const colors = scheme === 'dark' ? dark : light
  return { colors, brand, type, spacing }
}

// Usage in any component:
const { colors, brand, type, spacing } = useTheme()
<View style={{ backgroundColor: colors.bgPrimary, padding: spacing.screenH }}>
  <Text style={[type.screenTitle, { color: colors.textPrimary }]}>
    your score.
  </Text>
</View>
```

---

## 10. Mock Data Shapes

### Incident Card (/data/radarFeed.ts)
```typescript
type IncidentCard = {
  id: string
  category: 'Banks' | 'Jobs' | 'Payments' | 'Identity' | 'Phishing'
  variant: 'incident' | 'avoided'
  headline: string        // short, natural, lowercase
  location: string        // "Brooklyn, NY"
  timestamp: string       // "2h ago"
  preview: string         // 2–4 lines, natural voice
  upvotes: number
  comments: number
  verified: boolean
  redFlags?: string[]     // for detail screen
  tactic?: string         // for detail screen
}
```

### Mock AI Response (/data/chatResponses.ts)
```typescript
type MockResponse = {
  triggers: string[]
  likelihood: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  botMessage: string      // conversational intro before the card
  redFlags: string[]
  looksOkay?: string[]
  whatToDoNext: string
  verifyYourself: string
  showGuideButton: boolean
}
```

### Question (/data/questions.ts)
```typescript
type Question = {
  id: number
  category: string
  type: 'simulation-tap' | 'slider' | 'multiple-choice' | 'scenario'
  prompt?: string
  simulation?: {
    uiType: 'message' | 'email' | 'alert' | 'notification'
    sender: string
    content: string
    preview?: string
  }
  options?: {
    label: string
    score: number         // 0 = safest, 3 = riskiest
    feedback?: string
  }[]
  sliderLabels?: { left: string; right: string }
}
```
