import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEN from './en/common.json';
import navigationEN from './en/navigation.json';
import settingsEN from './en/settings.json';
import commandPaletteEN from './en/commandPalette.json';
import dashboardEN from './en/dashboard.json';
import errorsEN from './en/errors.json';
import commonDE from './de/common.json';
import navigationDE from './de/navigation.json';
import settingsDE from './de/settings.json';
import commandPaletteDE from './de/commandPalette.json';
import dashboardDE from './de/dashboard.json';
import errorsDE from './de/errors.json';

import roleSelectionEN from './en/roleSelection.json';
import roleSelectionDE from './de/roleSelection.json';

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
        },
        de: {
            common: commonDE,
            navigation: navigationDE,
            settings: settingsDE,
            commandPalette: commandPaletteDE,
            dashboard: dashboardDE,
            errors: errorsDE,
            roleSelection: roleSelectionDE,
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
