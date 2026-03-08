import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'

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
    files: ['src/components/**/*.{ts,tsx}', 'src/user/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: [
                '@/features/*/api/*',
                '@/features/*/components/*',
                '@/features/*/hooks/*',
                '@/features/*/pages/*',
                '@/features/*/types/*',
                '@/features/*/utils/*',
                '@/features/*/data/*',
              ],
              message:
                'Avoid deep feature imports in shared/user layers. Prefer feature public entrypoints (e.g. `@/features/<feature>`).',
            },
          ],
        },
      ],
    },
  },
])
