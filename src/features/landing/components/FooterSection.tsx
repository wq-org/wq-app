import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { landingFooterGroups } from '@/features/landing/components/navigation/navigation-content'

export function FooterSection() {
  const { t } = useTranslation('navigation')

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              to="/"
              aria-label="go home"
              className="block size-fit"
            >
              <Logo />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
            {landingFooterGroups.map((group) => (
              <div
                key={group.key}
                className="space-y-4 text-sm"
              >
                <span className="block font-medium">{t(`landing.footer.groups.${group.key}`)}</span>
                {group.items.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    className="block text-muted-foreground duration-150 hover:text-primary"
                  >
                    <span>{t(`landing.footer.items.${item.key}`)}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <div className="order-last flex flex-col gap-2 text-center text-sm text-muted-foreground md:order-first">
            <span>{t('landing.footer.meta.rights', { year: new Date().getFullYear() })}</span>
            <span className="text-xs">{t('landing.footer.meta.attribution')}</span>
          </div>

          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="block text-muted-foreground hover:text-primary"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                />
              </svg>
            </a>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="block text-muted-foreground hover:text-primary"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
