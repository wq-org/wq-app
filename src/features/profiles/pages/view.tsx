import { ProfileView } from '../components/ProfileView'
import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'

export default function ProfileViewPage() {
  const { getRole } = useUser()
  const role = getRole() || 'student'

  return (
    <>
      <ProfileView />
      <CommandPalette role={role} />
    </>
  )
}





