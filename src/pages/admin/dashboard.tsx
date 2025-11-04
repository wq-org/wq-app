import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';

export default function AdminDashboard() {
    const handleClickTab = (tabId: string) => {
        console.log('Admin tab clicked:', tabId);
    };

    return (
            <div>
                <DashboardLayout
                    userName="@Admin"
                    description="Welcome to the admin dashboard"
                    role="admin"
                    onClickTab={handleClickTab}
                >
                    <h1>Admin Dashboard</h1>
                </DashboardLayout>
                
                <CommandPalette role="admin" />
            </div>
    );
}