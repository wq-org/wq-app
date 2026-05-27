import type { SerializedEditorState } from 'lexical'

export type GameOpenQuestionNodeData = {
  label?: string
  title?: string
  /** Rich exercise description (Lexical JSON), shown to learners at game start. */
  descriptionContent?: SerializedEditorState | null
  /** Max total score this node can award. */
  points?: number
}
