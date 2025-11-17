import GameCard from './GameCard';
import type { GameCardProps } from './GameCard';

interface GameCardListProps {
    games: GameCardProps[];
    onGamePlay?: () => void;
}

export default function GameCardList({
    games,
    onGamePlay,
}: GameCardListProps) {
    return (
        <div className="flex flex-wrap gap-6">
            {games.map((game) => (
                <div key={game.id} className="flex-1 min-w-[320px] max-w-[350px] flex justify-center">
                    <GameCard
                        {...game}
                        onPlay={onGamePlay}
                    />
                </div>
            ))}
        </div>
    );
}

