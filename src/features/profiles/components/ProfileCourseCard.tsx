import { Card, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserPlus } from 'lucide-react'
import type { EnrollmentStatus, ProfileCourseCardData } from '@/features/course'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { useAvatarUrl } from '@/features/onboarding'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { getThemeBackgroundStyle } from '@/lib/themes'

interface ProfileCourseCardProps extends ProfileCourseCardData {
  onJoin?: (id: string) => void
  joinStatus?: EnrollmentStatus
  isLoadingJoin?: boolean
  joinDisabled?: boolean
}

export function ProfileCourseCard({
  id,
  title,
  description,
  image,
  themeId,
  teacherAvatar,
  teacherInitials = 'U',
  onJoin,
  onView,
  joinStatus,
  isLoadingJoin = false,
  joinDisabled = false,
}: ProfileCourseCardProps) {
  const { t } = useTranslation('features.course')
  const canJoin = joinStatus !== 'accepted'
  const isJoined = joinStatus === 'accepted'
  const canOpen = isJoined && typeof onView === 'function'
  const { url: teacherAvatarUrl } = useAvatarUrl(teacherAvatar)

  return (
    <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer">
      <CardHeader className="relative flex flex-col justify-start items-start px-0 gap-4">
        <AspectRatio
          ratio={16 / 9}
          className="w-full"
        >
          {image ? (
            <img
              src={image}
              alt={t('card.imageAlt')}
              className="rounded-t-3xl rounded-b-none h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-t-3xl rounded-b-none"
              style={getThemeBackgroundStyle(themeId)}
            >
              <Text
                as="span"
                variant="h1"
                className="select-none text-white/25"
              >
                {title.charAt(0).toUpperCase()}
              </Text>
            </div>
          )}
        </AspectRatio>
      </CardHeader>
      <CardContent className="flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 rounded-full">
            {teacherAvatarUrl ? (
              <AvatarImage
                src={teacherAvatarUrl}
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
          <div className="flex items-center justify-end gap-2 mt-auto">
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
                  {t('join.actions.join')}
                </Text>
                <UserPlus className="w-4 h-4" />
              </Button>
            )}

            {canOpen && (
              <Button
                variant="ghost"
                onClick={() => onView?.(id)}
                className="text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 transition-all duration-200 active:animate-in active:zoom-in-95"
              >
                <Text
                  as="p"
                  variant="body"
                >
                  {t('card.open')}
                </Text>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {isJoined && !canOpen && (
              <Button
                variant="active"
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
