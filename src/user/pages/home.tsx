import { useLayoutEffect } from 'react'
import { HeroSection, FooterSection, Feature6, Navigation } from '@/features/landing'
import { LanguageSwitcher, ThemeModeToggle } from '@/components/shared'
import { useTheme } from '@/hooks/useTheme'
import { Brush, ChartSpline, Microscope, SplinePointer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation('navigation')
  const { applyPublicTheme } = useTheme()

  useLayoutEffect(() => {
    applyPublicTheme()
  }, [applyPublicTheme])

  return (
    <div className="relative">
      <div className="fixed inset-x-0 top-0 z-50">
        <Navigation />
      </div>
      <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card/90 p-2 text-foreground shadow-sm backdrop-blur supports-backdrop-filter:bg-card/75 sm:right-6 sm:bottom-6">
        <ThemeModeToggle />
        <LanguageSwitcher />
      </div>

      <HeroSection />

      <section className="bg-background px-6">
        <Feature6
          badgeText={t('landing.home.gameStudio.badge')}
          description={t('landing.home.gameStudio.description')}
          title={t('landing.home.gameStudio.title')}
          cards={[
            {
              title: t('landing.home.gameStudio.cards.scenarioEditor.title'),
              description: t('landing.home.gameStudio.cards.scenarioEditor.description'),
              icon: SplinePointer,
              backgroundColor: 'pink',
              wide: true,
              hasIconInside: true,
              isBlurred: true,
            },
            {
              title: t('landing.home.gameStudio.cards.didactics.title'),
              description: t('landing.home.gameStudio.cards.didactics.description'),
              icon: Microscope,
              backgroundColor: 'violet',
              hasIconInside: true,
              isBlurred: true,
            },
            {
              title: t('landing.home.gameStudio.cards.feedback.title'),
              description: t('landing.home.gameStudio.cards.feedback.description'),
              icon: Brush,
              backgroundColor: 'cyan',
              hasIconInside: true,
              isBlurred: true,
            },
            {
              title: t('landing.home.gameStudio.cards.analytics.title'),
              description: t('landing.home.gameStudio.cards.analytics.description'),
              icon: ChartSpline,
              wide: true,
              backgroundColor: 'orange',
              hasIconInside: true,
              isBlurred: true,
            },
          ]}
        />
      </section>
      <FooterSection />
    </div>
  )
}
