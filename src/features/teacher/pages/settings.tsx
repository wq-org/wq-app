import { AppShell } from '@/components/layout'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

export function TeacherSettingsPage() {
  return (
    <AppShell role="teacher">
      <SettingsPage role="teacher" />
    </AppShell>
  )
}
