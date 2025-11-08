import DashboardLayout from '@/components/layout/DashboardLayout';
import CommandPalette from '@/features/command-palette/components/CommandPalette';
import InstitutionForm from '@/components/admin/InstitutionForm';
import { useFullProfile } from '@/hooks/useFullProfile';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';

const AdminDashboardInner = () => {
  const { profile, loading } = useFullProfile();
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url);

  if (loading) return null;

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