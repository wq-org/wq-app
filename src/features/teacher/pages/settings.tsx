import { AppShell } from '@/components/layout'
import { SettingsPage } from '@/features/settings'

const TeacherSettingsPage = () => {
  return (
    <AppShell role="teacher">
      <SettingsPage role="teacher" />
    </AppShell>
  )
}

export { TeacherSettingsPage }
