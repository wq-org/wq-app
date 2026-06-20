import { useTranslation } from 'react-i18next'

import { LandingPageShell } from '@/features/landing'

export function DocsPage() {
  const { t } = useTranslation('navigation')

  return (
    <LandingPageShell title={t('landing.docs.title')}>
      <p className="max-w-2xl text-muted-foreground">{t('landing.docs.placeholder')}</p>
    </LandingPageShell>
  )
}
