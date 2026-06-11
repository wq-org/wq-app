import { createContext, useContext, type ReactNode, type RefObject } from 'react'

type CurvedScrollbarContextValue = {
  viewportRef: RefObject<HTMLDivElement | null>
}

const CurvedScrollbarContext = createContext<CurvedScrollbarContextValue | null>(
  null,
)

export function CurvedScrollbarProvider({
  viewportRef,
  children,
}: CurvedScrollbarContextValue & { children: ReactNode }) {
  return (
    <CurvedScrollbarContext.Provider value={{ viewportRef }}>
      {children}
    </CurvedScrollbarContext.Provider>
  )
}

export function useCurvedScrollbarContext() {
  const context = useContext(CurvedScrollbarContext)

  if (!context) {
    throw new Error(
      'Curved scrollbar layout components must be used within <CurvedScrollbar>.',
    )
  }

  return context
}
