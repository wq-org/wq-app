import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type TabsContentProps = {
  children: ReactNode
  className?: string
  /** When both are set, this panel renders only for the active tab. */
  tabId?: string
  activeTabId?: string
}

export function TabsContent({ children, className, tabId, activeTabId }: TabsContentProps) {
  if (tabId !== undefined && activeTabId !== undefined && tabId !== activeTabId) {
    return null
  }

  return (
    <div
      className={cn('mt-3 p-3  min-w-0', className)}
      role="tabpanel"
    >
      {children}
    </div>
  )
}
