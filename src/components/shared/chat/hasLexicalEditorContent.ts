import { isBlankLessonDraftState } from '@/features/lesson'

/** True when serialized Lexical state has visible text or block content. */
export function hasLexicalEditorContent(value: unknown): boolean {
  return !isBlankLessonDraftState(value)
}
