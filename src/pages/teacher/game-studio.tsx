import AppWrapper from '@/components/layout/AppWrapper';
import {Camera, Grid, CheckCircle, Brain} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import GameCardList from '@/features/game-studio/components/GameCardList';
import type { GameCardProps } from '@/features/game-studio/components/GameCard';

const games: GameCardProps[] = [
    {
        title: 'Photo Flash',
        route: '/student/dashboard/games/photoflash',
        id: 'photoflash',
        button: 'Play',
        description: 'Identify wound images in the Photo Flash game.',
        icon: Camera,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
    },
    {
        title: 'Photo Flash Lv. 2',
        route: '/student/dashboard/games/photoflash-lv2',
        id: 'photoFlashLv2',
        button: 'Play',
        description: 'Find the matching image for a given term.',
        icon: Camera,
        color: 'text-teal-500',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
    },
    {
        title: 'Four out of four',
        route: '/student/dashboard/games/fourOutOfFour',
        id: 'four_out_of_four',
        button: 'Play',
        description: 'Answer quiz questions with four possible choices.',
        icon: Grid,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
    },
    {
        title: 'Fact or Fake',
        route: '/student/dashboard/games/factorfake',
        id: 'fact_or_fake',
        button: 'Play',
        description: 'Decide whether statements are true or false.',
        icon: CheckCircle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
    },
    {
        title: 'Strategy',
        route: '/student/dashboard/games/strategy',
        id: 'strategy',
        button: 'Play',
        description: 'Make decisions in complex case studies.',
        icon: Brain,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
    },
];

export default function GameStudio() {
    const navigate = useNavigate();
    const navigateTo = (route: string) => {
        navigate(route);
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
