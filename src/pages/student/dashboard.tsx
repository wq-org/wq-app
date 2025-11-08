import DashboardLayout from '@/components/layout/DashboardLayout';
import { CommandPalette } from '@/features/command-palette';
import { useFullProfile } from '@/hooks/useFullProfile';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';

export default function Dashboard() {
    const { profile, loading } = useFullProfile();
    const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url);

    if (loading) return null;

    return (
        <>
            <DashboardLayout
                imageUrl={signedAvatarUrl || undefined}
                userName={profile?.display_name || profile?.username || '@Student'}
                description={profile?.description || 'Welcome to your dashboard'}
                role="student"
            />

            <CommandPalette role="student" />
        </>
    );
}
