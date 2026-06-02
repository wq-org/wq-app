import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'
import { GameProjectCard } from './GameProjectCard'
import { GameProjectCardCompact } from './GameProjectCardCompact'
import type { GameProjectCardListProps } from '../types/game-studio.types'

export function GameProjectCardList({
  projects,
  onOpen,
  variant = 'default',
  className,
  scrollAreaClassName,
}: GameProjectCardListProps) {
  const handleOpen = (projectId: string) => onOpen?.(projectId)

  if (variant === 'compact') {
    return (
      <BlurredScrollArea
        orientation="horizontal"
        hideScrollBar
        className={cn('w-full min-h-0', scrollAreaClassName)}
        viewportClassName="pb-1"
      >
        <div className={cn('flex w-max flex-nowrap gap-3', className)}>
          {projects.map((project) => (
            <GameProjectCardCompact
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              themeId={project.themeId}
              status={project.status}
              onView={handleOpen}
            />
          ))}
        </div>
      </BlurredScrollArea>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-6', className)}>
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex min-w-[320px] max-w-[350px] flex-1 animate-in fade-in-0 slide-in-from-bottom-4 justify-center"
        >
          <GameProjectCard
            id={project.id}
            title={project.title ?? 'Untitled Project'}
            description={project.description ?? 'No description'}
            themeId={project.themeId}
            version={project.version}
            status={project.status}
            onOpen={() => handleOpen(project.id)}
          />
        </div>
      ))}
    </div>
  )
}
