import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TopicTabs, type TopicTabId } from './TopicTabs'

export interface TopicWorkspaceShellProps {
  activeTab: TopicTabId
  onTabChange: (tab: TopicTabId) => void
  children: ReactNode
  className?: string
  tabsClassName?: string
  contentClassName?: string
}

export function TopicWorkspaceShell({
  activeTab,
  onTabChange,
  children,
  className,
  tabsClassName,
  contentClassName,
}: TopicWorkspaceShellProps) {
  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      <TopicTabs
        activeTabId={activeTab}
        onTabChange={onTabChange}
        className={cn('border-b', tabsClassName)}
      />
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  )
}

export const TopicLayout = TopicWorkspaceShell
