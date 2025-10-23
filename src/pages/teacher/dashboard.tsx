import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';

export default function Dashboard() {
    return (
        <>
            <DashboardLayout
                imageUrl="https://github.com/hngngn.png"
                userName="John Doe"
                description="Software Engineer passionate about web development and teaching. this is the new feature"
                role="teacher"
            >
                <p>TEACHER </p>
            </DashboardLayout>

            <CommandPalette />
        </>
    );
}
