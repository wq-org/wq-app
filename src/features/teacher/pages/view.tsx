import { ProfileView } from '@/features/profiles/components/ProfileView'
import { CommandPalette } from '@/features/command-palette'

export default function TeacherViewPage() {
  return (
    <>
      <ProfileView />
      <CommandPalette commandBarContext="teacher" />
    </>
  )
}
