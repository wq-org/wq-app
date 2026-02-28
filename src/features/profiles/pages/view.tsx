import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'
import { ProfileView } from '../components/ProfileView'

export default function ProfileViewPage() {
  const { getRole } = useUser()
  const role = getRole() || 'student'

  return (
    <>
      <ProfileView />
      <CommandPalette commandBarContext={role} />
    </>
  )
}
