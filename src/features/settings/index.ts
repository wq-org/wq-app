export { SettingsAppearanceSection } from './components/SettingsAppearanceSection'
export { InstitutionEmailChangeSection } from './components/InstitutionEmailChangeSection'
export { SettingsAvatarSection } from './components/SettingsAvatarSection'
export { SettingsLoadingState } from './components/SettingsLoadingState'
export { SettingsProfileForm } from './components/SettingsProfileForm'
export { SettingsProfileSection } from './components/SettingsProfileSection'
export { SettingsReadonlyFields } from './components/SettingsReadonlyFields'
export {
  requestInstitutionEmailChange,
  redeemInstitutionEmailChange,
} from './api/institutionEmailChangeApi'
export { useSettingsProfileForm } from './hooks/useSettingsProfileForm'
export { useSettingsProfilePage } from './hooks/useSettingsProfilePage'
export { settingsCapabilitiesByRole } from './config/settingsCapabilities'
export type {
  InstitutionEmailChangeRequestState,
  SettingsCapabilities,
  SettingsFormValues,
  SettingsProfileSectionProps,
  SettingsSaveValues,
} from './types/settings.types'
