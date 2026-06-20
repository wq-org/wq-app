import { useTranslation } from 'react-i18next'

import { LandingPageShell } from '@/features/landing'

export type LegalPageKey = 'impressum' | 'agb'

type LegalPageProps = {
  page: LegalPageKey
}

export function LegalPage({ page }: LegalPageProps) {
  const { t } = useTranslation('navigation')

  return (
    <LandingPageShell title={t(`landing.legal.${page}.title`)}>
      <p className="max-w-2xl text-muted-foreground">{t(`landing.legal.${page}.placeholder`)}</p>
    </LandingPageShell>
  )
}
