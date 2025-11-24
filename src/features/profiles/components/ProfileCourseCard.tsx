import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { DEFAULT_COURSE_IMAGE } from '@/lib/constants'
import type { CourseCardProps } from '@/features/courses/types/course.types'

interface ProfileCourseCardProps extends CourseCardProps {
  onJoin?: (id: string) => void
}

export function ProfileCourseCard({
  id,
  title,
  description,
  image,
  teacherAvatar,
  teacherInitials = 'U',
  onJoin,
}: ProfileCourseCardProps) {
  const courseImage = image || DEFAULT_COURSE_IMAGE

  return (
    <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer">
      <CardHeader className="relative flex flex-col justify-start items-start px-0 gap-4">
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
              <AvatarImage
                src={teacherAvatar}
                alt="avatar"
              />
            ) : (
              <AvatarFallback className="text-xl">{teacherInitials || 'U'}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
                  {title}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{title}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Description area */}
        <div className="flex flex-col gap-3">
          <p className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
            {description}
          </p>
          {/* Join Button */}
          <div className="flex items-center gap-2 mt-auto">
            <Button
              variant="ghost"
              onClick={() => {
                onJoin?.(id)
              }}
              className="text-blue-500 hover:opacity-80 h-auto"
            >
              <p>Join</p>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}





