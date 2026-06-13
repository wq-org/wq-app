export { LessonCard } from './components/LessonCard'
export type { LessonCardProps } from './components/LessonCard'
export { LessonCardList } from './components/LessonCardList'
export type { LessonCardListProps } from './components/LessonCardList'
export { LessonForm } from './components/LessonForm'
export type { LessonFormProps } from './components/LessonForm'
export { LessonFilter } from './components/LessonFilter'
export type { LessonFilterProps } from './components/LessonFilter'
export { LessonSettingsDrawer } from './components/LessonSettingsDrawer'
export type { LessonSettingsDrawerProps } from './components/LessonSettingsDrawer'
export {
  createLesson,
  deleteLesson,
  getLessonById,
  getLessonsByTopicId,
  getTeacherLessonById,
  getTeacherLessonTopicRefById,
  getTeacherLessonsByTopicId,
  updateLesson,
} from './api/lessonsApi'
export {
  useLessonAutosave,
  DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  DEFAULT_AUTOSAVE_MAX_DOC_BYTES,
  LESSON_HYDRATION_TAG,
  type SaveStatus,
  type UseLessonAutosaveOptions,
} from './hooks/useLessonAutosave'
export { useLessonAgentPanel } from './hooks/useLessonAgentPanel'
export { useLessonAgentPdfFiles } from './hooks/useLessonAgentPdfFiles'
export { useLessonPrefetch } from './hooks/useLessonPrefetch'
export { useLessons } from './hooks/useLessons'
export { LessonAgentPage } from './pages/LessonAgentPage'
export { Lesson as LessonRoute } from './pages/lesson'
export { LessonRedirect } from './pages/LessonRedirect'
export { LessonView } from './pages/LessonView'
export {
  createEmptyLessonDraftState,
  normalizeLessonDraftState,
  lessonDraftStateToJson,
  lessonDraftStateToJson as stringifyLessonDraftState,
} from './utils/lessonDraftState'
export {
  createDefaultLessonLexicalState,
  isBlankLessonDraftState,
  LESSON_CONTENT_SCHEMA_VERSION,
  resolveLessonDraftState,
} from './utils/createDefaultLessonLexicalState'
export { formatRelativeUpdatedTime } from './utils/relativeTime'
export type { RelativeUpdatedTimeLabels } from './utils/relativeTime'
export type {
  CreateLessonData,
  Lesson,
  LessonBlockTypeRegistryRow,
  LessonDraftState,
  LessonTopicRef,
  UpdateLessonData,
} from './types/lesson.types'
export { LESSON_SEARCH_FIELDS } from './types/lesson.types'
