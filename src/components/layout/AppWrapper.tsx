import React from 'react';
import Container from '../common/Container';
import Navigation from '../common/Navigation';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import { cn } from '@/lib/utils';

interface AppWrapperProps {
    children: React.ReactNode;
    role: 'teacher' | 'student' | 'admin';
    className?: string;
    commandPaletteRole?: 'teacher' | 'student' | 'admin' | 'game-studio';
    authenticated?: boolean;
    currentPageName?: string;
}

function AppWrapper({ children, role, className, commandPaletteRole, authenticated = true, currentPageName }: AppWrapperProps) {
    const paletteRole = commandPaletteRole || role;
    
    return (       
        <>
         <Navigation authenticated={authenticated} currentPageName={currentPageName} />
        <Container className={cn(className)}>
      {children}
        </Container>

       {authenticated && <CommandPalette role={paletteRole} />}
        </>
);
}

export default AppWrapper;
