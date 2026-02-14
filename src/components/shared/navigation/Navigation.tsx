import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu-styles'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href?: string
  items?: { title: string; description: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Problem & Lösung',
    items: [
      {
        title: 'Herausforderung',
        description: 'Die Bildungslandschaft im Wandel.',
        href: '#problem',
      },
      {
        title: 'Unsere Lösung',
        description: 'Gamifizierte Lernplattform für nachhaltigen Erfolg.',
        href: '#loesung',
      },
    ],
  },
  {
    label: 'Für wen?',
    items: [
      { title: 'Lehrende', description: 'Für Pädagogen und Dozenten.', href: '#lehrende' },
      { title: 'Lernende', description: 'Für Studierende und Schüler:innen.', href: '#lernende' },
      {
        title: 'Institutionen',
        description: 'Für Schulen und Hochschulen.',
        href: '#institutionen',
      },
    ],
  },
  {
    label: 'Produkt (Plattform)',
    items: [
      {
        title: 'Plattform-Features',
        description: 'Übersicht aller Funktionen.',
        href: '#features',
      },
      { title: 'Spiele-Editor', description: 'Eigene Lernspiele erstellen.', href: '#editor' },
      { title: 'Analytics', description: 'Fortschritt und Engagement messen.', href: '#analytics' },
    ],
  },
  {
    label: 'Didaktik & Evidenz',
    items: [
      {
        title: 'Didaktisches Konzept',
        description: 'Wissenschaftlich fundierter Ansatz.',
        href: '#didaktik',
      },
      { title: 'Evidenzbasierung', description: 'Studien und Evaluierungen.', href: '#evidenz' },
    ],
  },
  {
    label: 'Über WQ',
    items: [
      { title: 'Über uns', description: 'Unser Team und unsere Vision.', href: '#ueber-uns' },
      { title: 'Partner', description: 'Kooperationen und Netzwerk.', href: '#partner' },
    ],
  },
  {
    label: 'Kontakt / Demo',
    href: '#kontakt',
    items: [
      {
        title: 'Kontakt aufnehmen',
        description: 'Schreiben Sie uns eine Nachricht.',
        href: '#kontakt',
      },
      { title: 'Demo buchen', description: 'Lernen Sie die Plattform kennen.', href: '#demo' },
    ],
  },
]

const linkClass =
  'block w-full rounded-sm px-3 py-2.5 text-left text-sm text-foreground no-underline outline-none transition-colors hover:bg-muted/80'

interface NavigationProps {
  showCtaButton?: boolean
  ctaLabel?: 'Pilot starten' | 'Demo anfragen'
  className?: string
}

export default function Navigation({
  showCtaButton = true,
  ctaLabel = 'Pilot starten',
  className,
}: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60',
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

        {/* Desktop nav */}
        <NavigationMenu
          viewport={false}
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <NavigationMenuList className="ml-0 flex flex-1 flex-wrap justify-center gap-1">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.items && item.items.length > 0 ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent [&_svg]:hidden">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.items.map((subItem) => (
                          <li key={subItem.title}>
                            <NavigationMenuLink asChild>
                              <a
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">
                                  {subItem.title}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {subItem.description}
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <a
                      href={item.href ?? '#'}
                      className={cn(navigationMenuTriggerStyle())}
                    >
                      {item.label}
                    </a>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA + mobile toggle */}
        <div className="flex shrink-0 items-center gap-2">
          {showCtaButton && (
            <Button
              asChild
              size="sm"
            >
              <Link to="/auth/signup">{ctaLabel}</Link>
            </Button>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            onClick={() => setMobileOpen((o) => !o)}
            className="-mr-2 flex p-2 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav - scrollable */}
      {mobileOpen && (
        <nav className="border-t bg-background/80 backdrop-blur-md lg:hidden">
          <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain">
            <ul className="flex flex-col gap-0.5 p-4">
              {navItems.map((item) =>
                item.items && item.items.length > 0 ? (
                  <li key={item.label}>
                    <span className="block px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </span>
                    <ul className="mb-2 flex flex-col">
                      {item.items.map((subItem) => (
                        <li key={subItem.title}>
                          <a
                            href={subItem.href}
                            onClick={() => setMobileOpen(false)}
                            className={linkClass}
                          >
                            {subItem.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={item.label}>
                    <a
                      href={item.href ?? '#'}
                      onClick={() => setMobileOpen(false)}
                      className={linkClass}
                    >
                      {item.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
