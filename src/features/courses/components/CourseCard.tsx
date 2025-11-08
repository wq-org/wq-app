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
import type { CourseCardProps } from '../types/course.types';

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
            <CardContent className="flex flex-col p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 rounded-full">
                        {teacherAvatar ? (
                            <AvatarImage src={teacherAvatar} alt="avatar" />
                        ) : (
                            <AvatarFallback className="text-xl">
                                {teacherInitials || 'U'}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CardTitle className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis">
                                {title}
                            </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{title}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Description area that can stretch */}
                <div className='flex flex-col gap-3'>
                    <CardDescription className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
                        {description}
                    </CardDescription>
                    {/* Button pinned to bottom */}
                    <Button className="mt-auto w-fit cursor-pointer" onClick={() => onView?.(id)}>
                        View
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

