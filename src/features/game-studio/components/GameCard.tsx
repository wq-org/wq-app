import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { Text } from '@/components/ui/text'
import type { GameCardProps } from '../types/game-studio.types'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { getThemeBackgroundStyle } from '@/lib/themes'

export default function GameCard({
  title,
  description,
  version,
  status,
  onPlay,
  imageUrl,
  themeId,
  button,
}: GameCardProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <Card className="w-[350px] rounded-4xl px-0 py-0 shadow-xl transition-all duration-200 hover:shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4">
      <CardHeader className="relative gap-4 px-0">
        <AspectRatio
          ratio={16 / 9}
          className="w-full"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t('gameCard.imageAlt', { defaultValue: 'Game cover image' })}
              className="h-full w-full rounded-t-3xl rounded-b-none object-cover"
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
        {status && (
          <Badge
            variant={status === 'published' ? 'default' : 'secondary'}
            className="absolute top-3 left-3"
          >
            {status === 'published' ? t('gameCard.status.published') : t('gameCard.status.draft')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col p-6">
        <div className="space-y-3">
          {version != null && (
            <Badge
              variant="outline"
              className="text-xs"
            >
              {t('gameCard.versionValue', { version })}
            </Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="line-clamp-1 min-w-0 cursor-default text-xl font-semibold">
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
          <CardDescription className="mt-3 min-h-[60px] line-clamp-3 text-left text-gray-500">
            {description}
          </CardDescription>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onPlay?.()
              }}
              className="border-0 text-blue-500 hover:bg-blue-100 hover:text-blue-500 hover:opacity-80 active:animate-in active:zoom-in-95"
            >
              <Text
                as="p"
                variant="body"
              >
                {button || t('gameCard.play')}
              </Text>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
