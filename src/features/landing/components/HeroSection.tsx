import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { t } = useTranslation('navigation')

  return (
    <section className="bg-background px-6 pt-28 md:pt-36 md:pb-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <h1 className="max-w-4xl text-balance text-5xl font-medium text-foreground md:text-6xl xl:text-7xl">
          {t('landing.hero.title')}
        </h1>
        <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          {t('landing.hero.description')}
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="px-5 text-base"
          >
            <Link to="/auth/signup">{t('landing.cta.startFree')}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="px-5 text-base"
          >
            <Link to="/contact">{t('landing.cta.contact')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
