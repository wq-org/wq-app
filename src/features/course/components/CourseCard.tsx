import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import type { CourseCardProps } from '../types/course.types'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { getThemeBackgroundStyle } from '@/lib/themes'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
export function CourseCard({
  id,
  title,
  description,
  is_published = false,
  image,
  themeId,
  teacherAvatar,
  teacherInitials = 'U',
  onView = () => {},
}: CourseCardProps) {
  const { t } = useTranslation('features.course')
  const { url: teacherAvatarUrl } = useAvatarUrl(teacherAvatar)

  return (
    <Card className="w-[320px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer animate-in fade-in-0 slide-in-from-bottom-4">
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
        <Badge
          variant={is_published ? 'default' : 'secondary'}
          className="absolute top-3 left-3 "
        >
          {is_published ? t('card.published') : t('card.unpublished')}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col p-6">
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

        <div className="flex flex-col gap-3">
          <CardDescription className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
            {description}
          </CardDescription>
          <div className="flex items-center justify-end gap-2 mt-auto">
            <Button
              variant="darkblue"
              onClick={() => {
                onView?.(id)
              }}
            >
              <Text
                as="p"
                variant="body"
              >
                {t('card.open')}
              </Text>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
