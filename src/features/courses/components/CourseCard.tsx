import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, EyeOff } from 'lucide-react'
import { DEFAULT_COURSE_IMAGE } from '@/lib/constants'
import type { CourseCardProps } from '../types/course.types'

export default function CourseCard({
  id,
  title,
  description,
  is_published = false,
  image,
  teacherAvatar,
  teacherInitials = 'U',
  onView = () => {},
}: CourseCardProps) {
  const courseImage = image || DEFAULT_COURSE_IMAGE

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
              <AvatarImage
                src={teacherAvatar}
                alt="avatar"
              />
            ) : (
              <AvatarFallback className="text-xl">{teacherInitials || 'U'}</AvatarFallback>
            )}
          </Avatar>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
                {title}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{title}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Description area that can stretch */}
        <div className="flex flex-col gap-3">
          <CardDescription className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
            {description}
          </CardDescription>
          {/* Button and published status icon */}
          <div className="flex items-center gap-2 mt-auto">
            <Button
              className="w-fit cursor-pointer"
              onClick={() => onView?.(id)}
            >
              View
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border ${
                    is_published
                      ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                      : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                  }`}
                >
                  {is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {is_published
                    ? 'Published - Students can see this course'
                    : 'Unpublished - Students cannot see this course'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Adjustable in course settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
