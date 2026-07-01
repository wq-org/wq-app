export { InstitutionAdminWorkspaceShell } from './components/InstitutionAdminWorkspaceShell'
export { InstitutionSubscriptionDetails } from './components/InstitutionSubscriptionDetails'
export { EmptyTeachersView } from './components/EmptyTeachersView'
export { InstitutionDashboard as InstitutionAdminDashboardPage } from './pages/dashboard'
export { InstitutionTeachers as InstitutionAdminTeachersPage } from './pages/teacher'
export { InstitutionStudents as InstitutionAdminStudentsPage } from './pages/students'
export { InstitutionUsers as InstitutionAdminUsersPage } from './pages/users'
export { InstitutionInviteUsers as InstitutionAdminInviteUsersPage } from './pages/invite-users'
export { InstitutionClassrooms as InstitutionAdminClassroomsPage } from './pages/classrooms'
export { ClassroomDetailPage as InstitutionAdminClassroomDetailPage } from './pages/classroom-detail'
export { AdminLicenses as InstitutionAdminLicensesPage } from './pages/licenses'
export { InstitutionUsage as InstitutionAdminUsagePage } from './pages/usage'
export { InstitutionGDPRRequest as InstitutionAdminGDPRRequestPage } from './pages/gdpr-request'
export { InstitutionAdminLicense as InstitutionAdminLicensePage } from './pages/license'
export { InstitutionAdminBillingPage } from './pages/billing'
export {
  InstitutionAdminCourseContentPage,
  InstitutionAdminCourseTopicLessonPage,
  InstitutionAdminCourseTopicPage,
} from './pages/course-content'
export { InstitutionCourses as InstitutionAdminCoursesPage } from './pages/courses'
export { InstitutionAdminGameDetailPage } from './pages/game-detail'
export { InstitutionGames as InstitutionAdminGamesPage } from './pages/games'
export { InstitutionAuditLogs as InstitutionAdminAuditLogsPage } from './pages/audit-logs'
export { InstitutionAdminSettings as InstitutionAdminSettingsPage } from './pages/settings'

export { useInstitutionLicensingForInstitution } from './hooks/useInstitutionLicensingForInstitution'
export { isTerminalBillingStatus } from './config/billingStatus'
export type {
  EffectiveFeature,
  EffectiveFeatureGroup,
  EffectiveFeatureSource,
} from './types/licensing.types'
