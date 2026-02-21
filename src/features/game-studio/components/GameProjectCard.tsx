import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowRight } from 'lucide-react'
import { Text } from '@/components/ui/text'
import type { GameProjectCardProps } from '../types/game-studio.types'
import { useTranslation } from 'react-i18next'
import SkeletonNodeGraph from './SkeletonNodeGraph'

export function GameProjectCard({
  title,
  description,
  version,
  status,
  onOpen,
}: GameProjectCardProps) {
  const { t } = useTranslation('features.gameStudio')
  const resolvedTitle = title || t('gameProjectCard.untitledProject')
  const resolvedDescription = description || t('gameProjectCard.noDescription')

  return (
    <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4">
      <CardHeader className="relative flex flex-col justify-start items-start px-0 gap-4">
        <SkeletonNodeGraph className="rounded-t-3xl rounded-b-none w-full h-48 overflow-hidden" />
        <Badge
          variant={status === 'published' ? 'default' : 'secondary'}
          className="absolute top-3 left-3"
        >
          {status === 'published'
            ? t('gameProjectCard.status.published')
            : t('gameProjectCard.status.draft')}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col p-6">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
                  {resolvedTitle}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <Text
                  as="p"
                  variant="body"
                  className="max-w-xs"
                >
                  {resolvedTitle}
                </Text>
              </TooltipContent>
            </Tooltip>
            {version != null && (
              <Badge
                variant="outline"
                className="text-xs shrink-0"
              >
                v{version}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <CardDescription className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
            {resolvedDescription}
          </CardDescription>
          <div className="flex items-center justify-end gap-2 mt-auto">
            <Button
              variant="ghost"
              onClick={() => onOpen?.()}
              className="text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 hover:duration-200 active:animate-in active:zoom-in-95"
            >
              <Text
                as="p"
                variant="body"
              >
                {t('gameProjectCard.open')}
              </Text>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
