import Container from '@/components/common/Container';
import { CommandPalette } from '@/features/command-palette';
import Navigation from '@/components/common/Navigation';

export default function GameStudio() {
    return (
        <>
            <Navigation />
            <Container>
                <h1 className="text-6xl">Game Studio Page</h1>
                <p className="text-gray-500 mt-2">
                    This is the platform where teachers can create and manage
                    educational games for their students.
                </p>
            </Container>

            <CommandPalette />
        </>
    );
}
