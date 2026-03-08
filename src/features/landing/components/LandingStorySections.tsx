import { useTranslation } from 'react-i18next'
import { landingNavigationGroups } from '@/features/landing/components/navigation/navigation-content'

export function LandingStorySections() {
  const { t } = useTranslation('navigation')

  return (
    <div className="bg-background">
      {landingNavigationGroups.map((group) => (
        <section
          key={group.key}
          id={group.sectionId}
          className="border-t"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20">
            <div>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                {t(`landing.groups.${group.key}.label`)}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  id={item.href.replace('#', '')}
                  className="rounded-2xl border bg-background p-8"
                >
                  <h3 className="text-2xl font-semibold text-foreground">
                    {t(`landing.items.${item.key}.title`)}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
