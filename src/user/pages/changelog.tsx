import { FooterSection, Navigation } from '@/features/landing'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import {
  Changelog,
  ChangelogBadge,
  ChangelogBadgeRow,
  ChangelogBullets,
  ChangelogDateGroup,
  ChangelogDescription,
  ChangelogDivider,
  ChangelogEntry,
  ChangelogEntryTitle,
  ChangelogHeader,
} from '@/components/ui/changelog'

import { changelogEntries } from '@/features/landing'

export default function ChangelogPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-50">
        <Navigation />
      </div>
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
        <LanguageSwitcher />
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pt-32 pb-20">
        <Changelog>
          <ChangelogHeader
            title="Product Changelog"
            description="A running record of the latest shipped work across course creation, onboarding, lesson previews, and game tools."
            updatedAt={changelogEntries[0]?.date}
          />

          {changelogEntries.map((entry, index) => (
            <ChangelogDateGroup
              key={entry.id}
              date={entry.date}
            >
              <ChangelogEntry>
                <ChangelogBadgeRow>
                  {entry.badges?.map((badge) => (
                    <ChangelogBadge
                      key={`${entry.id}-${badge}`}
                      variant={badge}
                    />
                  ))}
                </ChangelogBadgeRow>

                <ChangelogEntryTitle>{entry.title}</ChangelogEntryTitle>

                <ChangelogDescription>{entry.summary}</ChangelogDescription>

                <ChangelogBullets items={entry.bullets} />

                {index < changelogEntries.length - 1 ? <ChangelogDivider /> : null}
              </ChangelogEntry>
            </ChangelogDateGroup>
          ))}
        </Changelog>
      </main>

      <FooterSection />
    </div>
  )
}
