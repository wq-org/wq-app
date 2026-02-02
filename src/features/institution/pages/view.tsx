import { ProfileView } from '@/features/profiles/components/ProfileView'
import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'

export default function InstitutionViewPage() {
  const { getRole } = useUser()
  const role = getRole() || 'student'

  return (
    <>
      <ProfileView />
      <CommandPalette commandBarContext={role} />
    </>
  )
}
