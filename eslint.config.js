import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'

const FEATURE_DEEP_IMPORT_PATTERNS = [
  '@/features/*/api/*',
  '@/features/*/components/*',
  '@/features/*/hooks/*',
  '@/features/*/pages/*',
  '@/features/*/types/*',
  '@/features/*/utils/*',
  '@/features/*/data/*',
  '@/features/*/config/*',
  '@/features/*/constants/*',
]

const RELATIVE_FEATURE_DEEP_IMPORT_PATTERNS = [
  './features/*/api/*',
  './features/*/components/*',
  './features/*/hooks/*',
  './features/*/pages/*',
  './features/*/types/*',
  './features/*/utils/*',
  './features/*/data/*',
  './features/*/config/*',
  './features/*/constants/*',
  '../features/*/api/*',
  '../features/*/components/*',
  '../features/*/hooks/*',
  '../features/*/pages/*',
  '../features/*/types/*',
  '../features/*/utils/*',
  '../features/*/data/*',
  '../features/*/config/*',
  '../features/*/constants/*',
]

const RESTRICTED_FEATURES = [
  'lesson',
  'onboarding',
  'command-palette',
  'files',
  'course',
  'topic',
  'student',
  'teacher',
  'institution',
  'institution-admin',
  'profile',
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: [...FEATURE_DEEP_IMPORT_PATTERNS, ...RELATIVE_FEATURE_DEEP_IMPORT_PATTERNS],
              message:
                'Avoid deep feature imports. Use `@/features/<feature>` public barrels for cross-feature imports, or local relative imports only inside the same feature.',
            },
          ],
        },
      ],
    },
  },
  ...RESTRICTED_FEATURES.map((featureName) => ({
    files: [`src/features/${featureName}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: [
                ...FEATURE_DEEP_IMPORT_PATTERNS,
                ...RELATIVE_FEATURE_DEEP_IMPORT_PATTERNS,
                `!@/features/${featureName}/*`,
              ],
              message:
                'Avoid deep imports into other features. Use `@/features/<feature>` public barrels; same-feature relative imports are allowed.',
            },
          ],
        },
      ],
    },
  })),
])
