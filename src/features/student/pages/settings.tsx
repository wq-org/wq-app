import { AppShell } from '@/components/layout'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

export const StudentSettingsPage = () => {
  return (
    <AppShell role="student">
      <SettingsPage role="student" />
    </AppShell>
  )
}
