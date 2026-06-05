import type { ReactNode } from 'react'

import { AppShell } from '@/components/layout'
import { cn } from '@/lib/utils'

type PublishedCoursePageShellProps = {
  children: ReactNode
  layout?: 'default' | 'fullBleed'
}

export function PublishedCoursePageShell({
  children,
  layout = 'default',
}: PublishedCoursePageShellProps) {
  if (layout === 'fullBleed') {
    return <AppShell role="teacher">{children}</AppShell>
  }

  return (
    <AppShell role="teacher">
      <div className={cn('container flex w-full flex-col gap-6 py-6')}>{children}</div>
    </AppShell>
  )
}
