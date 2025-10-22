import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';

export default function Dashboard() {
    return (
        <>
            <DashboardLayout
                imageUrl="https://example.com/profile.jpg"
                userName="John Doe"
                description="Software Engineer passionate about web development and teaching."
            />

            <CommandPalette />
        </>
    );
}
