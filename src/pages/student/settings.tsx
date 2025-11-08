import SettingsLayout from '@/components/layout/SettingsLayout';
import { useUser } from '@/contexts/UserContext';
import PulsarLoading from '@/components/ui/pulsar-loading';

export default function Settings() {
    const { profile, loading } = useUser();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <PulsarLoading variant="gray" size="xl" speed={1750} />
            </div>
        );
    }

    return (
        <SettingsLayout profile={profile} loading={loading}>
            <h1>Student Settings Page</h1>
        </SettingsLayout>
    );
}
