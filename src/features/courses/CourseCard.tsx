// src/features/courses/components/CourseCard.tsx

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';



export interface CourseCardProps {
    title: string;
    description: string;
    image: string;
    teacherAvatar?: string;
    teacherInitials?: string;
    onView?: () => void;
}

export default function CourseCard({
    title,
    description,
    image,
    teacherAvatar,
    teacherInitials = 'U',
    onView,
}: CourseCardProps) {
    return (
        <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl">
            <CardHeader className="flex flex-col justify-start items-start px-0 gap-4">
                <img
                    src={image}
                    alt="Course"
                    className="rounded-t-3xl rounded-b-none w-full h-48 object-cover"
                />
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-start pb-3">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl font-semibold text-left w-full">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-left w-full">
                        {description}
                    </CardDescription>
                </div>
                <div className="flex justify-between w-full items-center">
                    <Button onClick={onView}>View</Button>
                    <Avatar className="w-12 h-12 rounded-full">
                        {teacherAvatar ? (
                            <AvatarImage src={teacherAvatar} alt="avatar" />
                        ) : (
                            <AvatarFallback className="text-xl">
                                {teacherInitials}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>
            </CardContent>
        </Card>
    );
}
