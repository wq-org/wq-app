import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import type { ClassroomDeliveredGame } from '../types/classroom-game.types'
import { ClassroomGameCard } from './ClassroomGameCard'

type ClassroomGameCardListProps = {
  classroomId: string
  games: readonly ClassroomDeliveredGame[]
  className?: string
}

export function ClassroomGameCardList({
  classroomId,
  games,
  className,
}: ClassroomGameCardListProps) {
  return (
    <BlurredScrollArea
      orientation="horizontal"
      hideScrollBar
      className="w-full min-h-0"
      viewportClassName="pb-1"
    >
      <div className={cn('flex w-max flex-nowrap gap-3', className)}>
        {games.map((game) => (
          <ClassroomGameCard
            key={game.id}
            classroomId={classroomId}
            id={game.id}
            title={game.title}
            description={game.description}
            themeId={game.themeId}
          />
        ))}
      </div>
    </BlurredScrollArea>
  )
}
