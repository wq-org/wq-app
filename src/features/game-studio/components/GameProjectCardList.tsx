import { GameProjectCard } from './GameProjectCard'
import type { GameProjectCardListProps } from '../types/game-studio.types'

export function GameProjectCardList({ projects, onOpen }: GameProjectCardListProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex-1 min-w-[320px] max-w-[350px] flex justify-center animate-in fade-in-0 slide-in-from-bottom-4"
        >
          <GameProjectCard
            id={project.id}
            title={project.title ?? 'Untitled Project'}
            description={project.description ?? 'No description'}
            themeId={project.themeId}
            version={project.version}
            status={project.status}
            onOpen={() => onOpen?.(project.id)}
          />
        </div>
      ))}
    </div>
  )
}
