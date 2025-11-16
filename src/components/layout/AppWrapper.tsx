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
}

function AppWrapper({ children, role, className, commandPaletteRole }: AppWrapperProps) {
    const paletteRole = commandPaletteRole || role;
    
    return (       
        <>
         <Navigation />
        <Container className={cn(className)}>
      {children}
        </Container>

        <CommandPalette role={paletteRole} />
        </>
);
}

export default AppWrapper;
