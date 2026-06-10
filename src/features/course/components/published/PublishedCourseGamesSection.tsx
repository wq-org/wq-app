import { useTranslation } from 'react-i18next'
import { Gamepad2, Joystick } from 'lucide-react'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { LoadingPage } from '@/components/shared'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { DashboardSection } from '@/features/dashboard'
import { GameProjectCardCompact, useCourseLinkedGames } from '@/features/game-studio'

type PublishedCourseGamesSectionProps = {
  courseId: string
  onGameOpen: (gameId: string) => void
}

export function PublishedCourseGamesSection({
  courseId,
  onGameOpen,
}: PublishedCourseGamesSectionProps) {
  const { t } = useTranslation('features.course')
  const { games, loading } = useCourseLinkedGames(courseId)

  return (
    <DashboardSection
      title={t('published.gamesSection.title')}
      icon={Joystick}
      classNameContainer="px-4 py-4"
      showContainerBorder
    >
      {loading ? (
        <LoadingPage
          variant="embedded"
          message={t('published.gamesSection.loading')}
          size={48}
        />
      ) : games.length === 0 ? (
        <Empty className="flex-none rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Gamepad2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('published.gamesSection.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('published.gamesSection.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <BlurredScrollArea
          orientation="horizontal"
          hideScrollBar
          className="w-full min-h-0"
          viewportClassName="pb-1"
        >
          <div className="flex w-max flex-nowrap gap-3">
            {games.map((game) => (
              <GameProjectCardCompact
                key={game.id}
                id={game.id}
                title={game.title}
                description={game.description}
                themeId={game.themeId}
                onView={onGameOpen}
              />
            ))}
          </div>
        </BlurredScrollArea>
      )}
    </DashboardSection>
  )
}
