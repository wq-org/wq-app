import { AppShell } from '@/components/layout'
import { SettingsPage } from '@/features/settings'

export const StudentSettingsPage = () => {
  return (
    <AppShell role="student">
      <SettingsPage role="student" />
    </AppShell>
  )
}
