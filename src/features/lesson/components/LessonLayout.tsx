import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LessonTabs, type LessonTabId } from './LessonTabs'

export interface LessonWorkspaceShellProps {
  activeTab: LessonTabId
  onTabChange: (tab: LessonTabId) => void
  children: ReactNode
  className?: string
  tabsClassName?: string
  contentClassName?: string
}

export function LessonWorkspaceShell({
  activeTab,
  onTabChange,
  children,
  className,
  tabsClassName,
  contentClassName,
}: LessonWorkspaceShellProps) {
  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      <LessonTabs
        activeTabId={activeTab}
        onTabChange={onTabChange}
        className={cn('border-b', tabsClassName)}
      />
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  )
}

export const LessonLayout = LessonWorkspaceShell
