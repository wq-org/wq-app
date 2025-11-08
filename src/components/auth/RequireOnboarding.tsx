import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import PulsarLoading from '@/components/ui/pulsar-loading';

export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PulsarLoading variant="black" size="xl" speed={1750} />
      </div>
    );
  }

  if (!profile?.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

