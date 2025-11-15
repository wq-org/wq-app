import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import InstitutionForm from '@/features/admin/pages/institution-form';
import { useUser } from '@/contexts/user';
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl';
import Spinner from '@/components/ui/spinner';

export default function AdminDashboard() {
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
    <div>
      <DashboardLayout
        imageUrl={signedAvatarUrl || undefined}
        userName={profile?.display_name || '@Admin'}
        username={profile?.username || undefined}
        email={profile?.email || undefined}
        linkedInUrl={profile?.linkedin_url || undefined}
        description={profile?.description || 'Welcome to the admin dashboard'}
        role="admin"
        onClickTab={() => {}}
      >
        <div className="w-full py-8">
          <InstitutionForm />
        </div>
      </DashboardLayout>
      <CommandPalette role="admin" />
    </div>
  );
} 