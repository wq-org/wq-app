import { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicPageFloatingControls } from '@/components/shared'
import { Text } from '@/components/ui/text'
import { FooterSection } from '@/features/landing/components/FooterSection'
import { Navigation } from '@/features/landing/components/navigation/Navigation'
import { useTheme } from '@/hooks/useTheme'

export function MissionVisionPage() {
  const { t } = useTranslation('navigation')
  const { applyPublicTheme } = useTheme()
  const paragraphs = t('landing.missionVision.paragraphs', { returnObjects: true }) as string[]

  useLayoutEffect(() => {
    applyPublicTheme()
  }, [applyPublicTheme])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 pt-28 pb-16">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <Text
            as="p"
            variant="small"
            muted
            className="text-xs font-medium uppercase tracking-[0.2em]"
          >
            {t('landing.missionVision.eyebrow')}
          </Text>
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                as="p"
                variant="body"
                muted
                className="text-pretty text-lg leading-relaxed md:text-xl"
              >
                {paragraph}
              </Text>
            ))}
          </div>
          <Text
            as="p"
            variant="small"
            muted
            className="italic"
          >
            {t('landing.missionVision.founder')}
          </Text>
        </div>
      </main>
      <FooterSection />
      <PublicPageFloatingControls />
    </div>
  )
}
