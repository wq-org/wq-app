import { Navigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { Spinner } from '@/components/ui/spinner'

export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="black"
          size="xl"
          speed={1750}
        />
      </div>
    )
  }

  if (!profile?.is_onboarded) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    )
  }

  return <>{children}</>
}
