import { create } from 'zustand'

type CategoryScores = {
  impulse: number
  habits: number
  socialPressure: number
  verification: number
  responseStyle: number
}

type UserState = {
  name: string
  isSignedIn: boolean
  score: number | null
  band: string | null
  bandColor: string | null
  categoryScores: CategoryScores
  xp: number
  streak: number
  badges: string[]
  lastTestDate: string | null
}

type UserActions = {
  signIn: (name: string) => void
  signOut: () => void
  setScore: (score: number, band: string, bandColor: string, categoryScores: CategoryScores) => void
  addXP: (amount: number) => void
  incrementStreak: () => void
  earnBadge: (badgeId: string) => void
  reset: () => void
}

const initialState: UserState = {
  name: '',
  isSignedIn: false,
  score: null,
  band: null,
  bandColor: null,
  categoryScores: {
    impulse: 0,
    habits: 0,
    socialPressure: 0,
    verification: 0,
    responseStyle: 0,
  },
  xp: 0,
  streak: 0,
  badges: [],
  lastTestDate: null,
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,

  signIn: (name) => set({ name, isSignedIn: true }),

  signOut: () => set({ ...initialState }),

  setScore: (score, band, bandColor, categoryScores) =>
    set({ score, band, bandColor, categoryScores, lastTestDate: new Date().toISOString() }),

  addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  earnBadge: (badgeId) =>
    set((state) => ({
      badges: state.badges.includes(badgeId) ? state.badges : [...state.badges, badgeId],
    })),

  reset: () => set({ ...initialState }),
}))
