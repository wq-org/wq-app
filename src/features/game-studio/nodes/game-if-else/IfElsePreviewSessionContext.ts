'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type IfElsePreviewSessionContextValue = {
  registerFooter: (content: ReactNode | null) => void
}

export const IfElsePreviewSessionContext = createContext<IfElsePreviewSessionContextValue | null>(
  null,
)

export function useIfElsePreviewSession(): IfElsePreviewSessionContextValue | null {
  return useContext(IfElsePreviewSessionContext)
}
