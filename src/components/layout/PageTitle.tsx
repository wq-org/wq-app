import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Route patterns mapped to translation keys
const ROUTE_PATTERNS: Array<{ pattern: RegExp; key: string }> = [
  // Teacher routes
  { pattern: /^\/teacher\/dashboard$/, key: 'teacherDashboard' },
  { pattern: /^\/teacher\/settings$/, key: 'teacherSettings' },
  { pattern: /^\/teacher\/game-studio$/, key: 'teacherGameStudio' },
  { pattern: /^\/teacher\/course\/[^/]+$/, key: 'teacherCourse' },
  { pattern: /^\/teacher\/course\/[^/]+\/lesson\/[^/]+$/, key: 'teacherCourseLesson' },
  { pattern: /^\/teacher\/lesson\/[^/]+$/, key: 'teacherLesson' },
  { pattern: /^\/teacher\/view\/[^/]+$/, key: 'teacherView' },
  { pattern: /^\/teacher\/chat$/, key: 'teacherChat' },
  { pattern: /^\/teacher\/institution$/, key: 'teacherInstitution' },
  // Student routes
  { pattern: /^\/student\/dashboard$/, key: 'studentDashboard' },
  { pattern: /^\/student\/settings$/, key: 'studentSettings' },
  { pattern: /^\/student\/chat$/, key: 'studentChat' },
  { pattern: /^\/student\/institution$/, key: 'studentInstitution' },
  { pattern: /^\/student\/view\/[^/]+$/, key: 'studentView' },
  // Admin routes
  { pattern: /^\/admin\/dashboard$/, key: 'adminDashboard' },
  // Profile routes
  { pattern: /^\/profile\/[^/]+$/, key: 'profile' },
  { pattern: /^\/institution\/[^/]+$/, key: 'institution' },
  // Onboarding
  { pattern: /^\/onboarding$/, key: 'onboarding' },
  // Auth routes
  { pattern: /^\/auth\/login$/, key: 'login' },
  { pattern: /^\/auth\/signup$/, key: 'signUp' },
  { pattern: /^\/auth\/forgot-password$/, key: 'forgotPassword' },
  { pattern: /^\/auth\/reset-password$/, key: 'resetPassword' },
  { pattern: /^\/auth\/verify-email$/, key: 'verifyEmail' },
]

/**
 * Function to match route to translation key
 */
function matchRouteToTitle(pathname: string): string {
  // Try to match route pattern
  for (const { pattern, key } of ROUTE_PATTERNS) {
    if (pattern.test(pathname)) {
      return key
    }
  }
  return 'default'
}

/**
 * PageTitle component that automatically determines the page title
 * based on the current route using i18n translations
 */
export function PageTitle() {
  const location = useLocation()
  const { t } = useTranslation('navigation')
  const pathname = location.pathname

  const routeKey = matchRouteToTitle(pathname)
  const translationKey = `pages.${routeKey}`
  const title = t(translationKey, { defaultValue: '' })

  // If translation exists and is not empty, return it
  if (title && title !== translationKey && title !== '') {
    return <>{title}</>
  }

  // Fallback to default
  return <>{t('pages.default', { defaultValue: 'Page' })}</>
}
