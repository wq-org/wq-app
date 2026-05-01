import type { UserRole } from '@/features/auth'
import { AppShell } from '@/components/layout'
import { useUser } from '@/contexts/user'
import { ProfileView } from '../components/ProfileView'

const ProfileViewPage = () => {
  const { getRole } = useUser()
  const role = (getRole() ?? 'student') as UserRole

  return (
    <AppShell role={role}>
      <ProfileView />
    </AppShell>
  )
}

export { ProfileViewPage }
