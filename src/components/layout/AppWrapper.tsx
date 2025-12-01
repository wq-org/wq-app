import React from 'react'
import Container from '../common/Container'
import Navigation from '../common/Navigation'
import CommandPalette from '@/features/command-palette/components/CommandPalette'
import { PageTitle } from './PageTitle'
import { cn } from '@/lib/utils'
import type { Roles } from '@/lib/dashboard.types'

interface AppWrapperProps {
  children: React.ReactNode
  role: Roles
  className?: string
  commandPaletteRole?: Roles | 'game-studio'
  authenticated?: boolean
}

function AppWrapper({
  children,
  role,
  className,
  commandPaletteRole,
  authenticated = true,
}: AppWrapperProps) {
  const paletteRole = commandPaletteRole || role

  return (
    <>
      <Navigation authenticated={authenticated}>
        <PageTitle />
      </Navigation>
      <Container className={cn(className)}>{children}</Container>

      {authenticated && <CommandPalette role={paletteRole} />}
    </>
  )
}

export default AppWrapper
