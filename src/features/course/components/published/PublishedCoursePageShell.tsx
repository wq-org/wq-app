import type { ReactNode } from 'react'

import { AppShell } from '@/components/layout'
import { cn } from '@/lib/utils'

type PublishedCoursePageShellProps = {
  children: ReactNode
  layout?: 'default' | 'fullBleed'
  role?: 'teacher' | 'student'
}

export function PublishedCoursePageShell({
  children,
  layout = 'default',
  role = 'teacher',
}: PublishedCoursePageShellProps) {
  if (layout === 'fullBleed') {
    return <AppShell role={role}>{children}</AppShell>
  }

  return (
    <AppShell role={role}>
      <div className={cn('container flex w-full flex-col gap-6 py-6')}>{children}</div>
    </AppShell>
  )
}
