export type LessonPage = {
  content: string
  id: string
  order: number
}

export type Lesson = {
  content: string
  created_at?: string
  description: string
  id: string
  pages: LessonPage[]
  title: string
  topic_id: string
  updated_at?: string
}

export type CreateLessonData = {
  content: string
  description: string
  pages?: LessonPage[]
  title: string
  topic_id: string
}

export type UpdateLessonData = Partial<{
  content: string
  description: string
  title: string
}>

export const LESSON_SEARCH_FIELDS = ['title', 'description'] as const
