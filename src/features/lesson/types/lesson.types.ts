/** Lexical core-ish types seeded in lesson_block_type_registry; extend via DB rows at runtime. */
export const CORE_BLOCK_TYPES = [
  'HeadingOne',
  'HeadingTwo',
  'HeadingThree',
  'Paragraph',
  'BulletedList',
  'NumberedList',
  'Quote',
  'Divider',
  'Image',
  'Video',
  'Callout',
  'Code',
  'Custom',
] as const

export type CoreBlockType = (typeof CORE_BLOCK_TYPES)[number]

/** Lexical plugin node types registered only in the DB registry */
export type CustomBlockType = string & { readonly __brand: 'CustomBlockType' }

export type LessonBlockType = CoreBlockType | CustomBlockType

export function isCoreBlockType(value: string): value is CoreBlockType {
  return (CORE_BLOCK_TYPES as readonly string[]).includes(value)
}

/** Raw DB row — snake_case (mirrors Postgres). */
export type LessonBlockRow = {
  id: string
  lesson_id: string
  institution_id: string
  block_type: string
  value: unknown
  meta_order: number
  meta_depth: number
  content_schema_version: number
  created_at: string
  updated_at: string
}

/** UI model — camelCase */
export type LessonBlock = {
  id: string
  lessonId: string
  type: LessonBlockType
  value: unknown
  order: number
  depth: number
  contentSchemaVersion: number
}

export type LessonBlockTypeRegistryRow = {
  block_type: string
  category: string
  is_lexical_core: boolean
  plugin_key: string | null
  created_at: string
}

export type LessonBlockEventType =
  | 'block_viewed'
  | 'block_time_spent'
  | 'block_skipped'
  | 'block_revisited'
  | 'block_focused'
  | 'block_copied'
  | 'block_link_clicked'

export type LessonPage = {
  content: string
  id: string
  order: number
}

export type Lesson = {
  /** @deprecated Legacy `lessons.content` JSONB; lesson body now lives in `lesson_blocks`. Not fetched by default. */
  content?: string
  created_at?: string
  description: string
  id: string
  /** @deprecated Legacy `lessons.pages` JSONB; superseded by `lesson_blocks`. Not fetched by default. */
  pages?: LessonPage[]
  title: string
  updated_at?: string
}

export type LessonTopicRef = {
  id: string
  topic_id: string
}

export type CreateLessonData = {
  /** Optional legacy `content` blob; `lesson_blocks` is the authoritative store. */
  content?: string
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
