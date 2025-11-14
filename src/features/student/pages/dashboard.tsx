import DashboardLayout from '@/components/layout/DashboardLayout';
import { CommandPalette } from '@/features/command-palette';
import { useUser } from '@/contexts/user';
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl';
import Spinner from '@/components/ui/spinner';

export default function Dashboard() {
    const { profile, loading } = useUser();
    const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner variant="gray" size="xl" speed={1750} />
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                imageUrl={signedAvatarUrl || undefined}
                userName={profile?.display_name || 'Student'}
                username={profile?.username || undefined}
                description={profile?.description || 'Welcome to your dashboard'}
                role="student"
            />

            <CommandPalette role="student" />
        </>
    );
}
