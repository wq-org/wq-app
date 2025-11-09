import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

export interface GameCardProps {
    id: string;
    title: string;
    description: string;
    route: string;
    button: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    onPlay?: (route: string) => void;
}

export default function GameCard({
    id: _id,
    title,
    description,
    route,
    button,
    icon: Icon,
    color,
    bgColor,
    borderColor,
    onPlay,
}: GameCardProps) {
    return (
        <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer">
            <CardHeader className="flex flex-col justify-start items-start px-0 gap-4">
                <div className={`w-full h-48 rounded-t-3xl rounded-b-none ${bgColor}`} />
            </CardHeader>
            <CardContent className="flex flex-col p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor} border ${borderColor}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
                        {title}
                    </CardTitle>
                </div>

                {/* Description area */}
                <div className="flex flex-col gap-3">
                    <CardDescription className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
                        {description}
                    </CardDescription>
                    {/* Button */}
                    <div className="flex items-center gap-2 mt-auto">
                        <Button 
                            className="w-fit cursor-pointer bg-black text-white hover:bg-gray-800" 
                            onClick={() => onPlay?.(route)}
                        >
                            {button}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

