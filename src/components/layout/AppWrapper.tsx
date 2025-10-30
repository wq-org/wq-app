import React from 'react';
import Container from '../common/Container';
import Navigation from '../common/Navigation';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
interface AppWrapperProps {
    children: React.ReactNode;
    role: 'teacher' | 'student';
}
function AppWrapper({ children, role }: AppWrapperProps) {
    return (       
        <>
         <Navigation />
        <Container>
      {children}
        </Container>

        <CommandPalette role={role} />
        </>
);
}

export default AppWrapper;
