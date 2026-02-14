import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { BACKGROUND_SCHOOL } from '@/lib/constants'
import type { CourseCardProps } from '../types/course.types'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'

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
  const { t } = useTranslation('features.courses')
  const courseImage = image || BACKGROUND_SCHOOL

  return (
    <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer">
      <CardHeader className="relative flex flex-col justify-start items-start px-0 gap-4">
        <img
          src={courseImage}
          alt="Course"
          className="rounded-t-3xl rounded-b-none w-full h-48 object-cover"
        />
        <Badge
          variant={is_published ? 'default' : 'secondary'}
          className="absolute top-3 left-3 "
        >
          {is_published ? t('card.published') : t('card.unpublished')}
        </Badge>
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
                <CardTitle className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
                  {title}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <Text
                  as="p"
                  variant="body"
                  className="max-w-xs"
                >
                  {title}
                </Text>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Description area that can stretch */}
        <div className="flex flex-col gap-3">
          <CardDescription className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
            {description}
          </CardDescription>
          {/* Button */}
          <div className="flex items-center justify-end gap-2 mt-auto">
            <Button
              variant="ghost"
              onClick={() => {
                onView?.(id)
              }}
              className="text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 hover:duration-200"
            >
              <Text
                as="p"
                variant="body"
              >
                View
              </Text>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
