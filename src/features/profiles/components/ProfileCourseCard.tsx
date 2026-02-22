import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { DEFAULT_COURSE_BACKGROUND } from '@/lib/constants'
import type { CourseCardProps } from '@/features/course/types/course.types'
import type { EnrollmentStatus } from '@/features/course/types/course.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

interface ProfileCourseCardProps extends CourseCardProps {
  onJoin?: (id: string) => void
  onCancelJoin?: (id: string) => void
  joinStatus?: EnrollmentStatus
  isLoadingJoin?: boolean
  joinDisabled?: boolean
}

export function ProfileCourseCard({
  id,
  title,
  description,
  image,
  teacherAvatar,
  teacherInitials = 'U',
  onJoin,
  onCancelJoin,
  joinStatus,
  isLoadingJoin = false,
  joinDisabled = false,
}: ProfileCourseCardProps) {
  const { t } = useTranslation('features.course')
  const courseImage = image || DEFAULT_COURSE_BACKGROUND
  const canJoin = !joinStatus || joinStatus === 'rejected' || joinStatus === 'cancelled'
  const isRequested = joinStatus === 'pending'
  const isJoined = joinStatus === 'accepted'
  const isRejected = joinStatus === 'rejected'

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
                <Text
                  as="h3"
                  variant="h3"
                  className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0"
                >
                  {title}
                </Text>
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

        {/* Description area */}
        <div className="flex flex-col gap-3">
          <Text
            as="p"
            variant="body"
            className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1"
          >
            {description}
          </Text>
          {/* Join Button */}
          <div className="flex items-center gap-2 mt-auto">
            {canJoin && (
              <Button
                variant="ghost"
                disabled={isLoadingJoin || joinDisabled}
                onClick={() => onJoin?.(id)}
                className="text-blue-500 hover:opacity-80 h-auto"
              >
                <Text
                  as="p"
                  variant="body"
                >
                  {isRejected ? t('join.actions.rejoin') : t('join.actions.join')}
                </Text>
                <UserPlus className="w-4 h-4" />
              </Button>
            )}

            {isRequested && (
              <>
                <Button
                  variant="outline"
                  className="h-auto"
                  disabled
                >
                  {t('join.status.requested')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto text-muted-foreground"
                  disabled={isLoadingJoin}
                  onClick={() => onCancelJoin?.(id)}
                >
                  {t('join.actions.cancel')}
                </Button>
              </>
            )}

            {isJoined && (
              <Button
                variant="outline"
                className="h-auto text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-50"
                disabled
              >
                {t('join.status.joined')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
