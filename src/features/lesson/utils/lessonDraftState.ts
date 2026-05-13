import type { SerializedEditorState } from 'lexical'

export const EMPTY_LESSON_DRAFT_STATE: SerializedEditorState = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

export function createEmptyLessonDraftState(): SerializedEditorState {
  return JSON.parse(JSON.stringify(EMPTY_LESSON_DRAFT_STATE)) as SerializedEditorState
}

export function normalizeLessonDraftState(value: unknown): SerializedEditorState {
  if (value && typeof value === 'object' && 'root' in value) {
    return value as SerializedEditorState
  }

  return createEmptyLessonDraftState()
}

export function lessonDraftStateToJson(value: unknown): string {
  return JSON.stringify(normalizeLessonDraftState(value))
}
