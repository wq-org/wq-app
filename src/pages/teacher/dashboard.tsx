import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
    return (
        <>
            <DashboardLayout
                imageUrl="https://example.com/profile.jpg"
                userName="John Doe"
                description="Software Engineer passionate about web development and teaching."
            />
        </>
    );
}
