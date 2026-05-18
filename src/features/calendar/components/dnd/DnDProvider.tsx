import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { CustomDragLayer } from './CustomDragLayer'

import type { ReactNode } from 'react'

type DnDProviderProps = {
  children: ReactNode
}

export function DnDProvider({ children }: DnDProviderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
      <CustomDragLayer />
    </DndProvider>
  )
}
