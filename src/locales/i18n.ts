import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// DE imports
import commonDE from './de/common.json';
import navigationDE from './de/navigation.json';
import settingsDE from './de/settings.json';
import commandPaletteDE from './de/commandPalette.json';
import dashboardDE from './de/dashboard.json';
import errorsDE from './de/errors.json';
import roleSelectionDE from './de/roleSelection.json';
import authDE from './de/auth.json';
import featuresAuthDE from './de/features/auth.json';
import featuresNotificationDE from './de/features/notification.json';
import featuresUploadFilesDE from './de/features/uploadFiles.json';
import featuresStudentDE from './de/features/student.json';
import featuresAdminDE from './de/features/admin.json';
import featuresInstitutionDE from './de/features/institution.json';
import featuresCoursesDE from './de/features/courses.json';
import featuresCommandPaletteDE from './de/features/commandPalette.json';
import featuresGameStudioDE from './de/features/gameStudio.json';
import featuresFilesDE from './de/features/files.json';
import featuresLessonsDE from './de/features/lessons.json';
import featuresGamesDE from './de/features/games.json';
import featuresTeacherDE from './de/features/teacher.json';
import featuresOnboardingDE from './de/features/onboarding.json';

// EN imports
import dashboardEN from './en/dashboard.json';
import errorsEN from './en/errors.json';
import commonEN from './en/common.json';
import navigationEN from './en/navigation.json';
import settingsEN from './en/settings.json';
import commandPaletteEN from './en/commandPalette.json';
import roleSelectionEN from './en/roleSelection.json';
import authEN from './en/auth.json';
import featuresAuthEN from './en/features/auth.json';
import featuresNotificationEN from './en/features/notification.json';
import featuresUploadFilesEN from './en/features/uploadFiles.json';
import featuresStudentEN from './en/features/student.json';
import featuresAdminEN from './en/features/admin.json';
import featuresInstitutionEN from './en/features/institution.json';
import featuresCoursesEN from './en/features/courses.json';
import featuresCommandPaletteEN from './en/features/commandPalette.json';
import featuresGameStudioEN from './en/features/gameStudio.json';
import featuresFilesEN from './en/features/files.json';
import featuresLessonsEN from './en/features/lessons.json';
import featuresGamesEN from './en/features/games.json';
import featuresTeacherEN from './en/features/teacher.json';
import featuresOnboardingEN from './en/features/onboarding.json';

i18n.use(initReactI18next).init({
    resources: {
        en: {
            common: commonEN,
            navigation: navigationEN,
            settings: settingsEN,
            commandPalette: commandPaletteEN,
            dashboard: dashboardEN,
            errors: errorsEN,
            roleSelection: roleSelectionEN,
            auth: authEN,
            'features.auth': featuresAuthEN,
            'features.notification': featuresNotificationEN,
            'features.uploadFiles': featuresUploadFilesEN,
            'features.student': featuresStudentEN,
            'features.admin': featuresAdminEN,
            'features.institution': featuresInstitutionEN,
            'features.courses': featuresCoursesEN,
            'features.commandPalette': featuresCommandPaletteEN,
            'features.gameStudio': featuresGameStudioEN,
            'features.files': featuresFilesEN,
            'features.lessons': featuresLessonsEN,
            'features.games': featuresGamesEN,
            'features.teacher': featuresTeacherEN,
            'features.onboarding': featuresOnboardingEN,
        },
        de: {
            common: commonDE,
            navigation: navigationDE,
            settings: settingsDE,
            commandPalette: commandPaletteDE,
            dashboard: dashboardDE,
            errors: errorsDE,
            roleSelection: roleSelectionDE,
            auth: authDE,
            'features.auth': featuresAuthDE,
            'features.notification': featuresNotificationDE,
            'features.uploadFiles': featuresUploadFilesDE,
            'features.student': featuresStudentDE,
            'features.admin': featuresAdminDE,
            'features.institution': featuresInstitutionDE,
            'features.courses': featuresCoursesDE,
            'features.commandPalette': featuresCommandPaletteDE,
            'features.gameStudio': featuresGameStudioDE,
            'features.files': featuresFilesDE,
            'features.lessons': featuresLessonsDE,
            'features.games': featuresGamesDE,
            'features.teacher': featuresTeacherDE,
            'features.onboarding': featuresOnboardingDE,
        },
    },
    lng: 'de',
    fallbackLng: 'en',
    ns: [
        'common',
        'navigation',
        'settings',
        'commandPalette',
        'dashboard',
        'errors',
        'roleSelection',
        'auth',
        'features.auth',
        'features.notification',
        'features.uploadFiles',
        'features.student',
        'features.admin',
        'features.institution',
        'features.courses',
        'features.commandPalette',
        'features.gameStudio',
        'features.files',
        'features.lessons',
        'features.games',
        'features.teacher',
        'features.onboarding',
    ],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
});
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
