import GameCard from './GameCard'
import type { GameCardListProps } from '../types/game-studio.types'

export default function GameCardList({ games, onGamePlay }: GameCardListProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {games.map((game) => (
        <div
          key={game.id}
          className="flex-1 min-w-[320px] max-w-[350px] flex justify-center animate-in fade-in-0 slide-in-from-bottom-4"
        >
          <GameCard
            id={game.id}
            title={game.title}
            description={game.description}
            imageUrl={game.imageUrl}
            themeId={game.themeId}
            version={game.version}
            status={game.status}
            button={game.button}
            onPlay={() => {
              if (game.onPlay) {
                game.onPlay()
                return
              }

              onGamePlay?.(game.route)
            }}
          />
        </div>
      ))}
    </div>
  )
}
