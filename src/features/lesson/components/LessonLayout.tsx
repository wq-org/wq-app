import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LessonTabs, type LessonTabId } from './LessonTabs'

export interface LessonLayoutProps {
  activeTab: LessonTabId
  onTabChange: (tab: LessonTabId) => void
  children: ReactNode
  className?: string
  tabsClassName?: string
  contentClassName?: string
}

export function LessonLayout({
  activeTab,
  onTabChange,
  children,
  className,
  tabsClassName,
  contentClassName,
}: LessonLayoutProps) {
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
