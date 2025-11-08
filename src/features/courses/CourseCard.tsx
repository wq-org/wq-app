// src/features/courses/components/CourseCard.tsx

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import bgBlueImage from '@/assets/img/backgrounds/bg-blue.jpeg';

export interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    image?: string;
    teacherAvatar?: string;
    teacherInitials?: string;
    onView?: (id: string) => void;
}

export default function CourseCard({
    id,
    title,
    description,
    image,
    teacherAvatar,
    teacherInitials = 'U',
    onView = () => {},
}: CourseCardProps) {
    const courseImage = image || bgBlueImage;

    return (
        <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer">
            <CardHeader className="flex flex-col justify-start items-start px-0 gap-4">
                <img
                    src={courseImage}
                    alt="Course"
                    className="rounded-t-3xl rounded-b-none w-full h-48 object-cover"
                />
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-start p-6 -mt-6">
                <Avatar className="w-12 h-12 rounded-full">
                    {teacherAvatar ? (
                        <AvatarImage src={teacherAvatar} alt="avatar" />
                    ) : (
                        <AvatarFallback className="text-xl">
                            {teacherInitials || 'U'}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="flex flex-col gap-1 w-full">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CardTitle className="text-xl font-semibold text-left w-full line-clamp-1 overflow-hidden text-ellipsis">
                                {title}
                            </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{title}</p>
                        </TooltipContent>
                    </Tooltip>
                    <CardDescription className="text-gray-500 text-left w-full line-clamp-3 overflow-hidden text-ellipsis">
                        {description}
                    </CardDescription>
                </div>
                <div className="flex justify-between w-full items-center">
                    <Button className='cursor-pointer' onClick={() => onView?.(id)}>View</Button>

                </div>
            </CardContent>
        </Card>
    );
}
