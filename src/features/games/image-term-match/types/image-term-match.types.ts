export interface Term {
  id: string
  value: string
}

export interface ImageTermMatchGameData {
  title: string | null
  description: string | null
  feedbackText: string | null
  filepath: string | null
  imagePreview: string | null
  answers: Array<{
    id: string
    value: string
    isCorrect: boolean
  }>
  correctAnswerId: string | null
}
