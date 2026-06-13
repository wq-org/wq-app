import { USER_ROLES } from '@/features/auth'
import { SettingsProfileSection } from '@/features/settings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

export const InstitutionAdminSettings = () => {
  return (
    <InstitutionAdminWorkspaceShell>
      <SettingsProfileSection
        role={USER_ROLES.INSTITUTION_ADMIN}
        embedded
      />
    </InstitutionAdminWorkspaceShell>
  )
}
