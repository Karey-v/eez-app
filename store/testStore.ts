import { create } from 'zustand'

type Answer = {
  questionId: number
  score: number
  category: string
}

type TestState = {
  currentQuestionIndex: number
  answers: Answer[]
  isComplete: boolean
}

type TestActions = {
  answerQuestion: (questionId: number, score: number, category: string) => void
  nextQuestion: () => void
  completeTest: () => void
  resetTest: () => void
}

export const useTestStore = create<TestState & TestActions>((set) => ({
  currentQuestionIndex: 0,
  answers: [],
  isComplete: false,

  answerQuestion: (questionId, score, category) =>
    set((state) => ({
      answers: [
        ...state.answers.filter((a) => a.questionId !== questionId),
        { questionId, score, category },
      ],
    })),

  nextQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  completeTest: () => set({ isComplete: true }),

  resetTest: () =>
    set({ currentQuestionIndex: 0, answers: [], isComplete: false }),
}))
