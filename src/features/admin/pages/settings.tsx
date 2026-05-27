import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { SettingsPage } from '@/features/settings'
import { USER_ROLES } from '@/features/auth'

const AdminSettings = () => {
  return (
    <AdminWorkspaceShell>
      <div className="pb-32">
        <SettingsPage
          role={USER_ROLES.SUPER_ADMIN}
          embedded
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminSettings }
