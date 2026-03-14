import { CommandPalette } from '@/features/command-palette'
import { SettingsPage } from '@/features/settings'

export function StudentSettingsPage() {
  return (
    <>
      <SettingsPage role="student" />
      <CommandPalette commandBarContext="student" />
    </>
  )
}
