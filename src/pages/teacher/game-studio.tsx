import AppWrapper from '@/components/layout/AppWrapper';
import {Card, CardFooter, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Camera, Grid, CheckCircle, Brain} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';

// Cards data moved to `games2` below

type GameCard = {
    title: string;
    route: string;
    id: string;
    button: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
};

const games2: GameCard[] = [
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
        // For now, navigate to the provided route
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-14">
                {games2.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Card key={idx} className="rounded-2xl shadow-lg bg-white animate-slideUpAndFade">
                            <CardHeader>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${card.bgColor} border ${card.borderColor}`}>
                                            <Icon className={`w-6 h-6 ${card.color.replace('text-', '') ? card.color : ''}`} />
                                        </div>
                                        <CardTitle className="text-2xl">{card.title}</CardTitle>
                                    </div>
                                    <CardDescription className="text-lg">{card.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button variant="default" className="rounded-lg hover:scale-95 active:scale-90 transition-all duration-200" onClick={() => navigateTo(card.route)}>
                                    Play Now
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

        </AppWrapper>
    );
}
