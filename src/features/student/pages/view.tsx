import { ProfileView } from '@/features/profiles/components/ProfileView'
import { CommandPalette } from '@/features/command-palette'

export default function StudentViewPage() {
  return (
    <>
      <ProfileView />
      <CommandPalette commandBarContext="student" />
    </>
  )
}
