import { CommandPalette } from '@/features/command-palette'
import { SettingsPage } from '@/features/settings'

export function TeacherSettingsPage() {
  return (
    <>
      <SettingsPage role="teacher" />
      <CommandPalette commandBarContext="teacher" />
    </>
  )
}
