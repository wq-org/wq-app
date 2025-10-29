import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export type StudentCardProps = {
    name: string;
    username: string;
    email: string;
    imgSrc: string;
};

export function StudentCard({ username, email, imgSrc }: StudentCardProps) {
    const getInitials = (n: string) =>
        n
            .split(' ')
            .map((word) => word[0])
            .join('');

    return (
        <Card className="w-80 aspect-square flex flex-col items-center justify-center shadow-lg rounded-4xl">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full w-full">
                <Avatar className="w-24 h-24 mb-4 shadow">
                    <AvatarImage src={imgSrc} alt={'name'} />
                    <AvatarFallback>{getInitials(email)}</AvatarFallback>
                </Avatar>
                <div className=" text-center  w-full">@{username}</div>
                <div className="text-muted-foreground text-center text-sm w-full mb-2">
                    {email}
                </div>
            </CardContent>
        </Card>
    );
}
