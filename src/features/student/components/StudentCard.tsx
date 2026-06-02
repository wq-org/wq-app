import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { StudentCardProps } from '../types/student.types'

export function StudentCard({ username, email, imgSrc }: StudentCardProps) {
  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((word) => word[0])
      .join('')

  return (
    <Card className="w-80 aspect-square flex flex-col items-center justify-center shadow-lg rounded-4xl">
      <CardContent className="flex flex-col items-center justify-center p-6 h-full w-full">
        <Avatar
          size="xl"
          className="mb-4 shadow"
        >
          <AvatarImage
            src={imgSrc}
            alt={'name'}
          />
          <AvatarFallback>{getInitials(email)}</AvatarFallback>
        </Avatar>
        <div className=" text-center  w-full">@{username}</div>
        <div className="text-muted-foreground text-center text-sm w-full mb-2">{email}</div>
      </CardContent>
    </Card>
  )
}
