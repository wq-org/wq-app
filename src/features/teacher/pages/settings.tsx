import { AppShell } from '@/components/layout'
import { SettingsPage } from '@/features/settings'

export function TeacherSettingsPage() {
  return (
    <AppShell role="teacher">
      <SettingsPage role="teacher" />
    </AppShell>
  )
}
