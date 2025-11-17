import AppWrapper from '@/components/layout/AppWrapper';
import {useNavigate} from 'react-router-dom';
import GameCardList from '@/features/game-studio/components/GameCardList';
import type { GameCardProps } from '@/features/game-studio/components/GameCard';

const games: GameCardProps[] = [
    {
        title: 'Photo Flash',
        route: '/teacher/canvas',
        id: 'photoflash',
        button: 'Play',
        description: 'Identify wound images in the Photo Flash game.',
    },
 
];

export default function GameStudio() {
    const navigate = useNavigate();
    const navigateTo = () => {
        navigate('/teacher/canvas');
    };
    return (
        <AppWrapper className="flex flex-col gap-12" role="teacher">
            <div>
                <h1 className="text-6xl">Game Studio Page</h1>
                <p className="text-gray-500 mt-2">
                    This is the platform where teachers can create and manage educational games for their students.
                </p>
            </div>
            <div className="pb-14">
                <GameCardList games={games} onGamePlay={navigateTo} />
            </div>
        </AppWrapper>
    );
}
