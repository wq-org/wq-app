import { FlaskConical, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'

export type GameNodeBetaNoticeProps = {
  /** Node display name shown in the heading (e.g. "Start", "End"). */
  nodeLabel: string
}

/**
 * Read-only placeholder for nodes whose editor/preview/settings are not yet
 * available (currently Start and End). Explains the beta state and nudges
 * authors toward the fully editable gameplay nodes.
 */
export function GameNodeBetaNotice({ nodeLabel }: GameNodeBetaNoticeProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          <FlaskConical className="size-6" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Text
            as="p"
            variant="small"
            muted
            bold
            className="uppercase tracking-wide"
          >
            {t('nodeBeta.badge')}
          </Text>
          <Text
            as="h2"
            variant="body"
            className="text-lg font-semibold text-foreground"
          >
            {t('nodeBeta.title', { node: nodeLabel })}
          </Text>
        </div>

        <Text
          as="p"
          variant="body"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {t('nodeBeta.description', { node: nodeLabel })}
        </Text>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-left">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <Text
            as="p"
            variant="small"
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {t('nodeBeta.creativityHint')}
          </Text>
        </div>
      </div>
    </div>
  )
}
