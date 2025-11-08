import CommandPalette from '@/features/command-palette/components/CommandPalette';
import SettingsLayout from '@/components/layout/SettingsLayout';
import { useUser } from '@/contexts/UserContext';
import Spinner from '@/components/ui/spinner';

export default function Settings() {
    const { profile, loading } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner variant="gray" size="xl" speed={1750} />
            </div>
        );
    }

    return (
        <>
            <SettingsLayout profile={profile} loading={loading} />

            <CommandPalette role="teacher" />
        </>
    );
}
