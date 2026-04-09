import { create } from 'zustand'

type LearnState = {
  completedModules: string[]
  currentModule: string | null
  currentLesson: number
}

type LearnActions = {
  startModule: (moduleId: string) => void
  advanceLesson: () => void
  completeModule: (moduleId: string) => void
  resetModule: () => void
}

export const useLearnStore = create<LearnState & LearnActions>((set) => ({
  completedModules: [],
  currentModule: null,
  currentLesson: 0,

  startModule: (moduleId) => set({ currentModule: moduleId, currentLesson: 0 }),

  advanceLesson: () => set((state) => ({ currentLesson: state.currentLesson + 1 })),

  completeModule: (moduleId) =>
    set((state) => ({
      completedModules: state.completedModules.includes(moduleId)
        ? state.completedModules
        : [...state.completedModules, moduleId],
      currentModule: null,
      currentLesson: 0,
    })),

  resetModule: () => set({ currentModule: null, currentLesson: 0 }),
}))
