import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LandingPageShell } from '@/components/landing/LandingPageShell'
import { landingPages } from '@/components/shared/navigation/navigation-content'

export default function LandingPage() {
  const location = useLocation()
  const { t } = useTranslation('navigation')

  const currentPage = useMemo(
    () => landingPages.find((page) => page.path === location.pathname),
    [location.pathname],
  )

  const title = currentPage ? t(`landing.items.${currentPage.key}.title`) : t('pages.default')

  return <LandingPageShell title={title} />
}
