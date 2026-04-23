import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { SettingsPage } from '@/features/settings'
import { USER_ROLES } from '@/features/auth'

const AdminSettings = () => {
  return (
    <AdminWorkspaceShell>
      <SettingsPage
        role={USER_ROLES.SUPER_ADMIN}
        embedded
      />
    </AdminWorkspaceShell>
  )
}

export { AdminSettings }
