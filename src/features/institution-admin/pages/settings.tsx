import { USER_ROLES } from '@/features/auth'
import { SettingsPage } from '@/features/settings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

export const InstitutionAdminSettings = () => {
  return (
    <InstitutionAdminWorkspaceShell>
      <SettingsPage
        role={USER_ROLES.INSTITUTION_ADMIN}
        embedded
      />
    </InstitutionAdminWorkspaceShell>
  )
}
