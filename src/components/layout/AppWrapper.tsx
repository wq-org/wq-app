import React from 'react';
import Container from '../common/Container';
import Navigation from '../common/Navigation';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import { cn } from '@/lib/utils';
interface AppWrapperProps {
    children: React.ReactNode;
    role: 'teacher' | 'student' | 'admin';
    className?: string;
}
function AppWrapper({ children, role, className }: AppWrapperProps) {
    return (       
        <>
         <Navigation />
        <Container className={cn(className)}>
      {children}
        </Container>

        <CommandPalette role={role} />
        </>
);
}

export default AppWrapper;
