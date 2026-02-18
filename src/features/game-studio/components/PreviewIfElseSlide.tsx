import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import GameInformationCard from '@/features/games/shared/GameInformationCard'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

interface PreviewIfElseSlideProps {
  title?: string
  description?: string
  condition?: string
  correctPath?: 'A' | 'B'
  branches?: {
    A?: string
    B?: string
  }
}

function BranchRow({
  label,
  destination,
  active,
  pathPrefix,
  notConnectedLabel,
  correctRouteLabel,
}: {
  label: 'A' | 'B'
  destination?: string
  active: boolean
  pathPrefix: string
  notConnectedLabel: string
  correctRouteLabel: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-3 py-2',
        active && 'border-primary/40 bg-primary/5',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant={active ? 'default' : 'outline'}>
          {pathPrefix} {label}
        </Badge>
        <Text
          as="span"
          variant="small"
          className="text-sm text-foreground truncate"
        >
          {destination && destination.trim() ? destination : notConnectedLabel}
        </Text>
      </div>
      {active && <Badge variant="secondary">{correctRouteLabel}</Badge>}
    </div>
  )
}

export function PreviewIfElseSlide({
  title,
  description,
  condition,
  correctPath = 'A',
  branches,
}: PreviewIfElseSlideProps) {
  const { t } = useTranslation('features.gameStudio')
  const displayTitle = title?.trim() || t('previewIfElse.ifElseFallback')
  const displayDescription = description?.trim() || ''
  const displayCondition = condition?.trim() || ''

  return (
    <div className="space-y-6">
      <GameInformationCard
        title={displayTitle}
        description={displayDescription}
      />
      <Card>
        <CardHeader className="space-y-1">
          <Text
            as="p"
            variant="body"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {t('previewIfElse.routingLogic')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-foreground"
          >
            {t('previewIfElse.routingDescription')}
          </Text>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Text
              as="p"
              variant="body"
              className="text-xs text-muted-foreground"
            >
              {t('previewIfElse.condition')}
            </Text>
            {displayCondition ? (
              <div className="rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {displayCondition}
              </div>
            ) : (
              <Text
                as="p"
                variant="body"
                className="text-sm text-muted-foreground"
              >
                {t('previewIfElse.noCondition')}
              </Text>
            )}
          </div>
          <div className="space-y-2">
            <Text
              as="p"
              variant="body"
              className="text-xs text-muted-foreground"
            >
              {t('previewIfElse.outgoingPaths')}
            </Text>
            <BranchRow
              label="A"
              destination={branches?.A}
              active={correctPath === 'A'}
              pathPrefix={t('previewIfElse.pathLabel')}
              notConnectedLabel={t('previewIfElse.notConnected')}
              correctRouteLabel={t('previewIfElse.correctRoute')}
            />
            <BranchRow
              label="B"
              destination={branches?.B}
              active={correctPath === 'B'}
              pathPrefix={t('previewIfElse.pathLabel')}
              notConnectedLabel={t('previewIfElse.notConnected')}
              correctRouteLabel={t('previewIfElse.correctRoute')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
