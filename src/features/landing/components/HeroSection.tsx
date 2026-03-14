import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  GraduationCap,
  Library,
  Microscope,
  Music,
  Palette,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GridIconBackground } from '@/components/shared'

type HeroIconEntry = {
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
}

const HERO_ICONS: HeroIconEntry[] = [
  {
    icon: GraduationCap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: BookOpen,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
  {
    icon: Pencil,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    icon: FlaskConical,
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/20',
  },
  {
    icon: Globe,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Calculator,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: Music,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  {
    icon: Palette,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
  {
    icon: Microscope,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
  },
  {
    icon: Library,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
]

export function HeroSection() {
  const { t } = useTranslation('navigation')

  return (
    <section className="min-h-screen bg-white">
      <GridIconBackground
        icons={HERO_ICONS}
        className="min-h-screen"
      >
        <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-16 text-center md:px-8 md:pt-32">
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
        </div>
      </GridIconBackground>
    </section>
  )
}
