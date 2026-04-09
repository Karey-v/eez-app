import { create } from 'zustand'
import { radarFeed as initialFeed } from '@/data/radarFeed'
import type { IncidentCard } from '@/data/radarFeed'

type RadarState = {
  feed: IncidentCard[]
  upvoted: string[]
}

type RadarActions = {
  addReport: (card: IncidentCard) => void
  toggleUpvote: (id: string) => void
}

export const useRadarStore = create<RadarState & RadarActions>((set) => ({
  feed: initialFeed,
  upvoted: [],

  addReport: (card) => set((state) => ({ feed: [card, ...state.feed] })),

  toggleUpvote: (id) =>
    set((state) => ({
      upvoted: state.upvoted.includes(id)
        ? state.upvoted.filter((i) => i !== id)
        : [...state.upvoted, id],
    })),
}))
