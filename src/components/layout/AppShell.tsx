import type { ReactNode } from 'react'
import { AppNavigation } from './AppNavigation'
import { CommandPalette } from '@/features/command-palette'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/features/auth'
import type { CommandBarContext } from '@/features/command-palette'

type AppShellProps = {
  children: ReactNode
  /** User role for layout/navigation; required. */
  role: UserRole
  className?: string
  /** Override which command bar to show (role-based or view-based). When not set, uses `role`. */
  commandBarContext?: CommandBarContext
}

export function AppShell({ children, role, className, commandBarContext }: AppShellProps) {
  const effectiveContext: CommandBarContext = commandBarContext ?? role

  return (
    <>
      <AppNavigation />
      <main className={cn('min-h-screen', className)}>{children}</main>
      <CommandPalette commandBarContext={effectiveContext} />
    </>
  )
}
