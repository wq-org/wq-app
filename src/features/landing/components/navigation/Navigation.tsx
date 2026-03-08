import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { landingNavigationGroups } from '@/features/landing/components/navigation/navigation-content'

const linkClass =
  'block w-full rounded-sm px-3 py-2.5 text-left text-sm text-foreground no-underline outline-none transition-colors hover:bg-muted/80'

interface NavigationProps {
  showCtaButton?: boolean
  ctaLabel?: string
  className?: string
}

export default function Navigation({ showCtaButton = true, ctaLabel, className }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation('navigation')

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60',
        className,
      )}
    >
      <div className="container mx-auto flex h-14 max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="WQ Health Home"
        >
          <Logo showText={false} />
        </Link>

        <NavigationMenu
          viewport={false}
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <NavigationMenuList className="ml-0 flex flex-1 flex-wrap justify-center gap-1">
            {landingNavigationGroups.map((group) => (
              <NavigationMenuItem key={group.key}>
                <NavigationMenuTrigger className="bg-transparent [&_svg]:hidden">
                  {t(`landing.groups.${group.key}.label`)}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {group.items.map((subItem) => (
                      <li key={subItem.key}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={subItem.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">
                              {t(`landing.items.${subItem.key}.title`)}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t(`landing.items.${subItem.key}.description`)}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center gap-2">
          {showCtaButton && (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
              >
                <Link to="/auth/login">{t('pages.login')}</Link>
              </Button>
              <Button
                asChild
                size="sm"
              >
                <Link to="/auth/signup">{ctaLabel ?? t('landing.cta.startFree')}</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? t('landing.mobile.close') : t('landing.mobile.open')}
            onClick={() => setMobileOpen((open) => !open)}
            className="-mr-2 flex p-2 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-background/80 backdrop-blur-md lg:hidden">
          <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain">
            <ul className="flex flex-col gap-0.5 p-4">
              {showCtaButton && (
                <li className="mb-3 flex flex-col gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to="/auth/login">{t('pages.login')}</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to="/auth/signup">{ctaLabel ?? t('landing.cta.startFree')}</Link>
                  </Button>
                </li>
              )}
              {landingNavigationGroups.map((group) => (
                <li key={group.key}>
                  <span className="block px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t(`landing.groups.${group.key}.label`)}
                  </span>
                  <ul className="mb-2 flex flex-col">
                    {group.items.map((subItem) => (
                      <li key={subItem.key}>
                        <Link
                          to={subItem.href}
                          onClick={() => setMobileOpen(false)}
                          className={linkClass}
                        >
                          {t(`landing.items.${subItem.key}.title`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
