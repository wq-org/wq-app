import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Text } from '@/components/ui/text'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useTranslation } from 'react-i18next'

type FacultyCardProps = {
  name: string | null | undefined
  description: string | null | undefined
  onOpen?: () => void
}

export function FacultyCard({ name, description, onOpen }: FacultyCardProps) {
  const { t } = useTranslation('features.institution-admin')
  const resolvedTitle = name?.trim() || t('faculties.card.untitled')
  const resolvedDescription = description?.trim() || t('faculties.card.noDescription')
  const initial = resolvedTitle.charAt(0).toUpperCase()

  return (
    <Card className="w-[350px] max-w-full py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4">
      <CardHeader className="relative flex flex-col justify-start items-start px-0 gap-4">
        <AspectRatio
          ratio={16 / 9}
          className="w-full"
        >
          <div className="flex h-full w-full items-center justify-center rounded-t-3xl rounded-b-none bg-linear-to-br from-[oklch(var(--oklch-indigo))] to-[oklch(var(--oklch-indigo))]/75">
            <Text
              as="span"
              variant="h1"
              className="select-none text-white/35"
            >
              {initial}
            </Text>
          </div>
        </AspectRatio>
      </CardHeader>
      <CardContent className="flex flex-col p-6">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <Badge
            variant="indigo"
            size="sm"
            className="font-normal"
          >
            {t('faculties.card.badge')}
          </Badge>
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
        </div>

        <div className="flex flex-col gap-3">
          <CardDescription className="text-muted-foreground text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
            {resolvedDescription}
          </CardDescription>
          <div className="flex items-center justify-end gap-2 mt-auto">
            <Button
              variant="darkblue"
              type="button"
              onClick={() => onOpen?.()}
            >
              <Text
                as="p"
                variant="body"
              >
                {t('faculties.card.open')}
              </Text>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
