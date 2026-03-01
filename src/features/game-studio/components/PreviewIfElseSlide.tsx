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
  correctMessage?: string
  wrongMessage?: string
  correctPath?: 'A' | 'B'
  branches?: {
    A?: string
    B?: string
  }
}

function BranchRow({
  label,
  destination,
  message,
  active,
  pathPrefix,
  notConnectedLabel,
  activeRouteLabel,
  branchMessageLabel,
  noMessageLabel,
}: {
  label: 'A' | 'B'
  destination?: string
  message?: string
  active: boolean
  pathPrefix: string
  notConnectedLabel: string
  activeRouteLabel: string
  branchMessageLabel: string
  noMessageLabel: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-3 py-2',
        active && 'border-orange-500/30 bg-orange-500/5',
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant={active ? 'orange' : 'outline'}>
            {active ? activeRouteLabel : pathPrefix} {label}
          </Badge>
          <Text
            as="span"
            variant="small"
            className="text-sm text-foreground truncate"
          >
            {destination && destination.trim() ? destination : notConnectedLabel}
          </Text>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <Text
            as="span"
            variant="small"
            className="text-xs font-medium text-muted-foreground"
          >
            {branchMessageLabel}
          </Text>
          <Text
            as="span"
            variant="small"
            className="text-sm text-muted-foreground"
          >
            {message && message.trim() ? message : noMessageLabel}
          </Text>
        </div>
      </div>
      <Badge variant={active ? 'orange' : 'outline'}>
        {pathPrefix} {label}
      </Badge>
    </div>
  )
}

export function PreviewIfElseSlide({
  title,
  description,
  condition,
  correctMessage,
  wrongMessage,
  correctPath = 'A',
  branches,
}: PreviewIfElseSlideProps) {
  const { t } = useTranslation('features.gameStudio')
  const displayTitle = title?.trim() || t('previewIfElse.ifElseFallback')
  const displayDescription = description?.trim() || ''
  const displayCondition = condition?.trim() || ''
  const displayCorrectMessage = correctMessage?.trim() || ''
  const displayWrongMessage = wrongMessage?.trim() || ''

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
          {displayCondition ? (
            <div className="space-y-2">
              <Text
                as="p"
                variant="body"
                className="text-xs text-muted-foreground"
              >
                {t('previewIfElse.legacyCondition')}
              </Text>
              <div className="rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {displayCondition}
              </div>
            </div>
          ) : null}
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
              message={correctPath === 'A' ? displayCorrectMessage : displayWrongMessage}
              active={correctPath === 'A'}
              pathPrefix={t('previewIfElse.pathLabel')}
              notConnectedLabel={t('previewIfElse.notConnected')}
              activeRouteLabel={t('previewIfElse.correctRoute')}
              branchMessageLabel={t('previewIfElse.branchMessage')}
              noMessageLabel={t('previewIfElse.noMessage')}
            />
            <BranchRow
              label="B"
              destination={branches?.B}
              message={correctPath === 'B' ? displayCorrectMessage : displayWrongMessage}
              active={correctPath === 'B'}
              pathPrefix={t('previewIfElse.pathLabel')}
              notConnectedLabel={t('previewIfElse.notConnected')}
              activeRouteLabel={t('previewIfElse.correctRoute')}
              branchMessageLabel={t('previewIfElse.branchMessage')}
              noMessageLabel={t('previewIfElse.noMessage')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
