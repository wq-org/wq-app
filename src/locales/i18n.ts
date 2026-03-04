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

// DE imports - Shared
import sharedLanguageSwitcherDE from './de/shared/languageSwitcher.json'

// DE imports - Features (alphabetically ordered to match directory structure)
import featuresAdminDE from './de/features/admin.json'
import featuresAuthDE from './de/features/auth.json'
import featuresCommandPaletteDE from './de/features/commandPalette.json'
import featuresCourseDE from './de/features/course.json'
import featuresFilesDE from './de/features/files.json'
import featuresGamesDE from './de/features/games.json'
import featuresGameStudioDE from './de/features/gameStudio.json'
import featuresInstitutionDE from './de/features/institution.json'
import featuresLessonDE from './de/features/lesson.json'
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

// EN imports - Shared
import sharedLanguageSwitcherEN from './en/shared/languageSwitcher.json'

// EN imports - Features (alphabetically ordered to match directory structure)
import featuresAdminEN from './en/features/admin.json'
import featuresCourseEN from './en/features/course.json'
import featuresFilesEN from './en/features/files.json'
import featuresGamesEN from './en/features/games.json'
import featuresGameStudioEN from './en/features/gameStudio.json'
import featuresInstitutionEN from './en/features/institution.json'
import featuresLessonEN from './en/features/lesson.json'
import featuresNotificationEN from './en/features/notification.json'
import featuresOnboardingEN from './en/features/onboarding.json'
import featuresStudentEN from './en/features/student.json'
import featuresTeacherEN from './en/features/teacher.json'
import featuresUploadFilesEN from './en/features/uploadFiles.json'

const LANGUAGE_STORAGE_KEY = 'wq-app:language'
const SUPPORTED_LANGUAGES = ['de', 'en'] as const

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

function normalizeLanguage(language?: string | null): SupportedLanguage | null {
  if (!language) {
    return null
  }

  const baseLanguage = language.toLowerCase().split('-')[0]
  return SUPPORTED_LANGUAGES.includes(baseLanguage as SupportedLanguage)
    ? (baseLanguage as SupportedLanguage)
    : null
}

function getStoredLanguage(): SupportedLanguage | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)) ?? undefined
  } catch {
    return undefined
  }
}

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
      'features.course': featuresCourseEN,
      'features.files': featuresFilesEN,
      'features.games': featuresGamesEN,
      'features.gameStudio': featuresGameStudioEN,
      'features.institution': featuresInstitutionEN,
      'features.lesson': featuresLessonEN,
      'features.notification': featuresNotificationEN,
      'features.onboarding': featuresOnboardingEN,
      'features.student': featuresStudentEN,
      'features.teacher': featuresTeacherEN,
      'features.uploadFiles': featuresUploadFilesEN,
      // Layout namespaces
      'layout.dashboardLayout': layoutDashboardLayoutEN,
      // Shared namespaces
      'shared.languageSwitcher': sharedLanguageSwitcherEN,
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
      'features.course': featuresCourseDE,
      'features.files': featuresFilesDE,
      'features.games': featuresGamesDE,
      'features.gameStudio': featuresGameStudioDE,
      'features.institution': featuresInstitutionDE,
      'features.lesson': featuresLessonDE,
      'features.notification': featuresNotificationDE,
      'features.onboarding': featuresOnboardingDE,
      'features.student': featuresStudentDE,
      'features.teacher': featuresTeacherDE,
      'features.uploadFiles': featuresUploadFilesDE,
      // Layout namespaces
      'layout.dashboardLayout': layoutDashboardLayoutDE,
      // Shared namespaces
      'shared.languageSwitcher': sharedLanguageSwitcherDE,
    },
  },
  lng: getStoredLanguage() ?? 'de',
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
    'features.course',
    'features.files',
    'features.games',
    'features.gameStudio',
    'features.institution',
    'features.lesson',
    'features.notification',
    'features.onboarding',
    'features.student',
    'features.teacher',
    'features.uploadFiles',
    // Layout namespaces
    'layout.dashboardLayout',
    // Shared namespaces
    'shared.languageSwitcher',
  ],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

const persistLanguage = (language: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedLanguage = normalizeLanguage(language)

  if (!normalizedLanguage) {
    return
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage)
  } catch {
    // Ignore storage write failures and keep runtime language switching functional.
  }
}

i18n.off('languageChanged', persistLanguage)
i18n.on('languageChanged', persistLanguage)

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
