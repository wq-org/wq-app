import { RequireAuth } from '@/features/auth'
import { InstitutionAdminDashboardPage } from '@/features/institution-admin'

export default function Test() {
  return (
    <RequireAuth>
      <InstitutionAdminDashboardPage />
    </RequireAuth>
  )
}
