import { useLayoutEffect, type ReactNode } from 'react'
import { AppNavigation } from './AppNavigation'
import { CommandPalette } from '@/features/command-palette'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/features/auth'
import type { CommandBarContext } from '@/features/command-palette'
import { useTheme } from '@/hooks/useTheme'

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
  const { applyAppTheme } = useTheme()

  useLayoutEffect(() => {
    applyAppTheme()
  }, [applyAppTheme])

  return (
    <>
      <AppNavigation />
      <main className={cn('min-h-screen', '-mt-10', className)}>{children}</main>
      <CommandPalette commandBarContext={effectiveContext} />
    </>
  )
}
