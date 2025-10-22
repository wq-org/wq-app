import DashboardLayout from '@/components/layout/DashboardLayout';
import { CommandPalette } from '@/features/command-palette';

const Dashboard = () => {
    return (
        <>
            <DashboardLayout
                imageUrl="https://github.com/shadcn.png"
                userName="Alex"
                description="Software Engineer passionate about web development and teaching."
                role="student"
            />

            <CommandPalette />
        </>
    );
};

export default Dashboard;
