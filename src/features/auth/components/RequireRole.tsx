import { Navigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { Spinner } from '@/components/ui/spinner'
import { getDashboardPathForRole, type UserRole } from '../types/auth.types'

type RequireRoleProps = {
  role: UserRole | UserRole[]
  children: React.ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { session, profile, loading } = useUser()

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

  const currentRole = (profile?.role ?? null) as UserRole | null
  const allowed = Array.isArray(role) ? role : [role]

  if (!currentRole || !allowed.includes(currentRole)) {
    return (
      <Navigate
        to={getDashboardPathForRole(currentRole)}
        replace
      />
    )
  }

  return <>{children}</>
}
