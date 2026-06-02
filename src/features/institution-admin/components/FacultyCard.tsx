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
    <div className="w-[350px] max-w-full rounded-4xl overflow-hidden bg-card border ring-1 ring-black/5 shadow-xl transition-all duration-200 hover:shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 flex flex-col">
      {/* Cover image */}
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[oklch(var(--oklch-indigo))] to-[oklch(var(--oklch-indigo))]/75">
          <Text
            as="span"
            variant="h1"
            className="select-none text-white/35"
          >
            {initial}
          </Text>
        </div>
      </AspectRatio>

      {/* Body */}
      <div className="flex flex-col gap-3 p-6 flex-1">
        <div className="flex flex-col items-start gap-2 min-w-0">
          <Badge
            variant="indigo"
            size="sm"
            className="font-normal"
          >
            {t('faculties.card.badge')}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis w-full">
                {resolvedTitle}
              </p>
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

        <p className="text-muted-foreground text-sm text-left min-h-[60px] line-clamp-3">
          {resolvedDescription}
        </p>

        <div className="flex items-center justify-end mt-auto">
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
    </div>
  )
}
