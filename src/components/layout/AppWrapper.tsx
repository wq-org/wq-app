import React from 'react'
import { Container, AppNavigation } from '@/components/shared'
import { CommandPalette } from '@/features/command-palette'
import { cn } from '@/lib/utils'
import type { Roles, CommandBarContext } from './config'

type AppWrapperProps = {
  children: React.ReactNode
  /** User role for layout/navigation; required. */
  role: Roles
  className?: string
  /** Override which command bar to show (role-based or view-based). When not set, uses `role`. */
  commandBarContext?: CommandBarContext
}

export function AppWrapper({ children, role, className, commandBarContext }: AppWrapperProps) {
  const effectiveContext: CommandBarContext = commandBarContext ?? role

  return (
    <>
      <AppNavigation />
      <Container className={cn(className)}>{children}</Container>
      <CommandPalette commandBarContext={effectiveContext} />
    </>
  )
}
