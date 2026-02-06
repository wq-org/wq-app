import { GameProjectCard } from './GameProjectCard'
import type { GameCardListProps } from '../types/game-studio.types'

export default function GameCardList({ games, onGamePlay }: GameCardListProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {games.map((game) => (
        <div
          key={game.id}
          className="flex-1 min-w-[320px] max-w-[350px] flex justify-center"
        >
          <GameProjectCard
            id={game.id}
            title={game.title}
            description={game.description}
            version={game.version}
            status={game.status}
            onOpen={() => onGamePlay?.(game.route)}
          />
        </div>
      ))}
    </div>
  )
}
