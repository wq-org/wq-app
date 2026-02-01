import AppWrapper from '@/components/layout/AppWrapper';
import { useNavigate } from 'react-router-dom';
import EmptyGamesView from '@/features/game-studio/components/EmptyGamesView';
import GameCardList from '@/features/game-studio/components/GameCardList';
import type { GameCardProps } from '@/features/game-studio/types/game-studio.types';
import { Button } from '@/components/ui/button';

const GAMES: GameCardProps[] = [];

export default function GameStudio() {
  const navigate = useNavigate();

  return (
    <AppWrapper className="flex flex-col gap-12" role="teacher">
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl">Game Studio</h1>
        <p className="text-gray-500 mt-2">
          Create and manage educational games for your students.
        </p>
        <div className="flex justify-end w-full">
          <Button onClick={() => navigate('/teacher/canvas')} variant="default">
            Create game
          </Button>
        </div>
      </div>
      <div className="pb-14">
        {GAMES.length === 0 ? (
          <EmptyGamesView />
        ) : (
          <GameCardList games={GAMES} onGamePlay={(route) => route && navigate(route)} />
        )}
      </div>
    </AppWrapper>
  );
}
 