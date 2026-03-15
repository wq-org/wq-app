import { AppShell } from '@/components/layout'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

export function StudentSettingsPage() {
  return (
    <AppShell role="student">
      <SettingsPage role="student" />
    </AppShell>
  )
}
