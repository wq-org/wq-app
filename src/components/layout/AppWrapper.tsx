import React from 'react'
import Container from '../common/Container'
import Navigation from '../common/Navigation'
import CommandPalette from '@/features/command-palette/components/CommandPalette'
import { PageTitle } from './PageTitle'
import { cn } from '@/lib/utils'

interface AppWrapperProps {
  children: React.ReactNode
  role: 'teacher' | 'student' | 'admin'
  className?: string
  commandPaletteRole?: 'teacher' | 'student' | 'admin' | 'game-studio'
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
