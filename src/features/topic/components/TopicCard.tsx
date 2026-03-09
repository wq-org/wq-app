import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Text } from '@/components/ui/text'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { getThemeBackgroundStyle } from '@/lib/themes'
import type { TopicCardProps } from '../types/topic.types'

export function TopicCard({ id, title, description, themeId, ctaLabel, onView }: TopicCardProps) {
  const { t } = useTranslation('features.course')

  return (
    <Card className="w-[350px] rounded-4xl px-0 py-0 shadow-xl transition-all duration-200 hover:shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4">
      <CardHeader className="relative flex flex-col items-start justify-start gap-4 px-0">
        <AspectRatio
          ratio={16 / 9}
          className="w-full"
        >
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
        </AspectRatio>
      </CardHeader>

      <CardContent className="flex flex-col p-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <CardTitle className="line-clamp-1 min-w-0 flex-1 overflow-hidden text-ellipsis text-xl font-semibold">
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

        <div className="mt-3 flex flex-col gap-3">
          <CardDescription className="mt-1 min-h-[60px] flex-1 line-clamp-3 overflow-hidden text-ellipsis text-left text-gray-500">
            {description}
          </CardDescription>

          <div className="mt-auto flex items-center justify-end gap-2">
            <Button
              variant="darkblue"
              onClick={() => onView?.(id)}
            >
              <Text
                as="p"
                variant="body"
              >
                {ctaLabel ?? t('card.open')}
              </Text>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
