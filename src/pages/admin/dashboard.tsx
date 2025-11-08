import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import InstitutionForm from '@/components/admin/InstitutionForm';
import { useUser } from '@/contexts/UserContext';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';
import Spinner from '@/components/ui/spinner';

const AdminDashboardInner = () => {
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
    <DashboardLayout
      imageUrl={signedAvatarUrl || undefined}
      userName={profile?.display_name || '@Admin'}
      description={profile?.description || 'Welcome to the admin dashboard'}
      role="admin"
      onClickTab={() => {}}
    >
      <div className="w-full py-8">
        <InstitutionForm />
      </div>
    </DashboardLayout>
  );
};

export default function AdminDashboard() {
    return (
        <div>
            <AdminDashboardInner />
            
            <CommandPalette role="admin" />
        </div>
    );
}