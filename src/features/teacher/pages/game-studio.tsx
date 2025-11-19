import AppWrapper from '@/components/layout/AppWrapper';
import {useNavigate} from 'react-router-dom';
import GameCardList from '@/features/game-studio/components/GameCardList';
import type { GameCardProps } from '@/features/game-studio/components/GameCard';

const games: GameCardProps[] = [
    {
        title: 'Canvas Game',
        route: '/teacher/canvas',
        id: 'canvas-game',
        button: 'Create',
        description: 'Create a canvas game for your students.',
    },
    {
        title: 'Image Term Match',
        route: '/game-studio/image-term-match',
        id: 'image-term-match',
        button: 'Create',
        description: 'Match images with their corresponding terms in this interactive game.',
    },
    {
        title: 'Image Pin Mark',
        route: '/game-studio/image-pin-mark',
        id: 'image-pin-mark',
        button: 'Create',
        description: 'Pin and mark specific areas on images to test knowledge.',
    },
    {
        title: 'Paragraph Line Select',
        route: '/game-studio/paragraph-line-select',
        id: 'paragraph-line-select',
        button: 'Create',
        description: 'Select sentences from paragraphs and answer questions about them.',
    },
];

export default function GameStudio() {
    const navigate = useNavigate();
    const navigateTo = (route?: string) => {
        if (route) {
            navigate(route);
        }
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
