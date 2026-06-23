import { createContext } from 'react'

export type FieldType = 'text' | 'image' | 'rich-text'

export interface GameNodeField {
  nodeId: string
  fieldKey: string
  label: string
  type: FieldType
  setValue: (value: string) => void
  /** Returns the field's current value; used to detect overwrites before insertion. */
  getValue?: () => string
  /**
   * Receives an uploaded image URL. Image-type fields treat this as a replacement;
   * rich-text fields insert it as a Lexical ImageNode.
   */
  insertImageUrl?: (url: string) => void
  /** Human label for the image-insert action shown in the crop overlay button. */
  imageInsertLabel?: string
}

export interface GameEditorContextValue {
  registerGetGameData: (getData: () => unknown) => void
  registerNodeFields: (fields: GameNodeField[]) => void
  unregisterNodeFields: (nodeId: string) => void
  getActiveNodeFields: () => GameNodeField[]
  activeNodeId: string | null
}

export type GetGameDataRef = { current: (() => unknown) | null }

export const GameEditorContext = createContext<GameEditorContextValue | null>(null)
