import React from 'react'
import { Container, Navigation } from '@/components/shared'
import CommandPalette from '@/features/command-palette/components/CommandPalette'
import { cn } from '@/lib/utils'
import type { Roles, CommandBarContext } from './config'

interface AppWrapperProps {
  children: React.ReactNode
  /** User role for layout/navigation; required. */
  role: Roles
  className?: string
  /** Override which command bar to show (role-based or view-based). When not set, uses `role`. */
  commandBarContext?: CommandBarContext
  authenticated?: boolean
}

function AppWrapper({ children, role, className, commandBarContext }: AppWrapperProps) {
  const effectiveContext: CommandBarContext = commandBarContext ?? role

  return (
    <>
      <Navigation />
      <Container className={cn(className)}>{children}</Container>
      <CommandPalette commandBarContext={effectiveContext} />
    </>
  )
}

export default AppWrapper
