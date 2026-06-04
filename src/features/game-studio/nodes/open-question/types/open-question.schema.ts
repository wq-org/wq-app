import type { SerializedEditorState } from 'lexical'

/** Single exercise (Aufgabe): learner prompt + teacher reference for scoring. */
export type OpenQuestionAuthoredQuestion = {
  id: string
  /** Shown to the learner in preview. */
  question: string
  /** Reference answer sent as `teacher_solution` to the scoring worker. */
  answer: string
  /** @deprecated Migrated to `question` on read — do not write new data here. */
  text?: string
}

export type GameOpenQuestionNodeData = {
  label?: string
  /**
   * @deprecated Canvas label uses `label`; authoring uses `descriptionContent` plus
   * per-exercise `question` / `answer`. Kept for legacy persisted nodes only.
   */
  title?: string
  /**
   * Rich task description (Lexical JSON). Preview/display only — never sent to
   * the scoring worker (`teacher_solution` comes from each exercise's `answer` field).
   */
  descriptionContent?: SerializedEditorState | null
  /** Max total score this node can award (split evenly across filled questions). */
  points?: number
  /**
   * Up to `OPEN_QUESTION_MAX_QUESTIONS` exercises (Frage + Musterlösung per tab).
   * Persisted on the canvas node via `onPatchNodeData`.
   */
  questions?: OpenQuestionAuthoredQuestion[]
  /** Last-selected Aufgabe tab in the editor (restored when reopening the dialog). */
  activeExerciseId?: string
}
