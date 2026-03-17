import { createContext, useContext } from 'react'

export type LessonFileTagRequest = {
  blockId?: string
  blockType: 'File' | 'Image' | 'Video'
  mode: 'insert' | 'replace'
  pageId: string
}

export type LessonEditorPageContextValue = {
  pageId: string
  readOnly: boolean
  requestFileTag: (request: LessonFileTagRequest) => void
}

const LessonEditorPageContext = createContext<LessonEditorPageContextValue | null>(null)

export const LessonEditorPageContextProvider = LessonEditorPageContext.Provider

export function useLessonEditorPageContext(): LessonEditorPageContextValue {
  const value = useContext(LessonEditorPageContext)

  if (!value) {
    throw new Error(
      'useLessonEditorPageContext must be used within LessonEditorPageContextProvider',
    )
  }

  return value
}
