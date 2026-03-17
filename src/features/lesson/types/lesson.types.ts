import type { YooptaContentValue } from '@yoopta/editor'
import type { LESSON_BLOCK_TYPES } from '../config/yooptaBlocks'

export type LessonBlockType = (typeof LESSON_BLOCK_TYPES)[number]

export type LessonFileKind = 'file' | 'image' | 'pdf' | 'video'

export type LessonFileTag = {
  kind: LessonFileKind
  mimeType: string | null
  name: string
  path: string
  size: number | null
}

export type LessonPage = {
  content: YooptaContentValue
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
  pages: LessonPage[]
  title: string
}>

export const LESSON_SEARCH_FIELDS = ['title', 'description'] as const
