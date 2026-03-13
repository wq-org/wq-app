// Pages
export { default as AdminDashboard } from './pages/dashboard'
export { default as AdminAnalyticsPage } from './pages/analytics'
export { default as AdminBillingPage } from './pages/billing'
export { default as AdminFeaturesPage } from './pages/features'
export { default as AdminInstitutionPage } from './pages/institution'
export { default as AdminLicensesPage } from './pages/licenses'
export { default as AdminNewInstitutionPage } from './pages/newInstitution'
export { default as AdminSettingsPage } from './pages/settings'
export { default as AdminSystemPage } from './pages/system'
export { default as AdminUsersPage } from './pages/users'

// Components
export { AdminWorkspaceShell } from './components/AdminWorkspaceShell'
export { default as InstitutionInformationForm } from './components/InstitutionInformationForm'

// Config
export {
  getAdminWorkspaceNavigation,
  resolveAdminWorkspaceRole,
} from './config/adminWorkspaceNavigation'
export type {
  AdminWorkspaceNavigation,
  AdminWorkspaceNavigationItem,
  AdminWorkspaceRole,
  AdminWorkspaceTeam,
} from './config/adminWorkspaceNavigation'

// Types
export type * from './types/institution.types'

// API
export * from './api/institutionApi'
export * from './api/licenseApi'
export * from './api/userApi'
export * from './api/billingApi'

// Hooks
// Add hooks exports when available
