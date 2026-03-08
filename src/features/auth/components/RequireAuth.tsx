import { Navigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import Spinner from '@/components/ui/spinner'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useUser()

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

  if (!session) {
    return (
      <Navigate
        to="/auth/login"
        replace
      />
    )
  }

  return <>{children}</>
}
