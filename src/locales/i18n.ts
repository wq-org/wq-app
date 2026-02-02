import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// DE imports - Root level
import commonDE from './de/common.json'
import errorsDE from './de/errors.json'
import navigationDE from './de/navigation.json'
import roleSelectionDE from './de/roleSelection.json'
import settingsDE from './de/settings.json'

// DE imports - Layout
import layoutDashboardLayoutDE from './de/layout/dashboardLayout.json'

// DE imports - Features (alphabetically ordered to match directory structure)
import featuresAdminDE from './de/features/admin.json'
import featuresAuthDE from './de/features/auth.json'
import featuresCommandPaletteDE from './de/features/commandPalette.json'
import featuresCoursesDE from './de/features/courses.json'
import featuresFilesDE from './de/features/files.json'
import featuresGamesDE from './de/features/games.json'
import featuresGameStudioDE from './de/features/gameStudio.json'
import featuresInstitutionDE from './de/features/institution.json'
import featuresLessonsDE from './de/features/lessons.json'
import featuresNotificationDE from './de/features/notification.json'
import featuresOnboardingDE from './de/features/onboarding.json'
import featuresStudentDE from './de/features/student.json'
import featuresTeacherDE from './de/features/teacher.json'
import featuresUploadFilesDE from './de/features/uploadFiles.json'

// EN imports - Root level
import featuresAuthEN from './en/features/auth.json'
import featuresCommandPaletteEN from './en/features/commandPalette.json'
import commonEN from './en/common.json'
import errorsEN from './en/errors.json'
import navigationEN from './en/navigation.json'
import roleSelectionEN from './en/roleSelection.json'
import settingsEN from './en/settings.json'

// EN imports - Layout
import layoutDashboardLayoutEN from './en/layout/dashboardLayout.json'

// EN imports - Features (alphabetically ordered to match directory structure)
import featuresAdminEN from './en/features/admin.json'
import featuresCoursesEN from './en/features/courses.json'
import featuresFilesEN from './en/features/files.json'
import featuresGamesEN from './en/features/games.json'
import featuresGameStudioEN from './en/features/gameStudio.json'
import featuresInstitutionEN from './en/features/institution.json'
import featuresLessonsEN from './en/features/lessons.json'
import featuresNotificationEN from './en/features/notification.json'
import featuresOnboardingEN from './en/features/onboarding.json'
import featuresStudentEN from './en/features/student.json'
import featuresTeacherEN from './en/features/teacher.json'
import featuresUploadFilesEN from './en/features/uploadFiles.json'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      // Root level namespaces (alphabetically ordered)
      auth: featuresAuthEN,
      commandPalette: featuresCommandPaletteEN,
      common: commonEN,
      errors: errorsEN,
      navigation: navigationEN,
      roleSelection: roleSelectionEN,
      settings: settingsEN,
      // Feature-based namespaces (alphabetically ordered to match directory structure)
      'features.admin': featuresAdminEN,
      'features.auth': featuresAuthEN,
      'features.commandPalette': featuresCommandPaletteEN,
      'features.courses': featuresCoursesEN,
      'features.files': featuresFilesEN,
      'features.games': featuresGamesEN,
      'features.gameStudio': featuresGameStudioEN,
      'features.institution': featuresInstitutionEN,
      'features.lessons': featuresLessonsEN,
      'features.notification': featuresNotificationEN,
      'features.onboarding': featuresOnboardingEN,
      'features.student': featuresStudentEN,
      'features.teacher': featuresTeacherEN,
      'features.uploadFiles': featuresUploadFilesEN,
      // Layout namespaces
      'layout.dashboardLayout': layoutDashboardLayoutEN,
    },
    de: {
      // Root level namespaces (alphabetically ordered)
      auth: featuresAuthDE,
      commandPalette: featuresCommandPaletteDE,
      common: commonDE,
      errors: errorsDE,
      navigation: navigationDE,
      roleSelection: roleSelectionDE,
      settings: settingsDE,
      // Feature-based namespaces (alphabetically ordered to match directory structure)
      'features.admin': featuresAdminDE,
      'features.auth': featuresAuthDE,
      'features.commandPalette': featuresCommandPaletteDE,
      'features.courses': featuresCoursesDE,
      'features.files': featuresFilesDE,
      'features.games': featuresGamesDE,
      'features.gameStudio': featuresGameStudioDE,
      'features.institution': featuresInstitutionDE,
      'features.lessons': featuresLessonsDE,
      'features.notification': featuresNotificationDE,
      'features.onboarding': featuresOnboardingDE,
      'features.student': featuresStudentDE,
      'features.teacher': featuresTeacherDE,
      'features.uploadFiles': featuresUploadFilesDE,
      // Layout namespaces
      'layout.dashboardLayout': layoutDashboardLayoutDE,
    },
  },
  lng: 'de',
  fallbackLng: 'en',
  ns: [
    // Root level namespaces (alphabetically ordered)
    'auth',
    'commandPalette',
    'common',
    'errors',
    'navigation',
    'roleSelection',
    'settings',
    // Feature-based namespaces (alphabetically ordered to match directory structure)
    'features.admin',
    'features.auth',
    'features.commandPalette',
    'features.courses',
    'features.files',
    'features.games',
    'features.gameStudio',
    'features.institution',
    'features.lessons',
    'features.notification',
    'features.onboarding',
    'features.student',
    'features.teacher',
    'features.uploadFiles',
    // Layout namespaces
    'layout.dashboardLayout',
  ],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n

/**
 * Clean-coding checklist:
 *
 * - Co-locate types by default; promote only when shared broadly.
 * - Use barrel files (e.g., src/types/index.ts) for shared types to reduce long import paths.
 * - Keep translation keys descriptive and avoid reusing keys for different contexts; maintain one source of truth per namespace.
 * - Stick to consistent naming:
 *     - PascalCase for component files
 *     - camelCase for variables/functions
 *     - kebab-case or lowercase for route page filenames if mirroring URLs
 */
