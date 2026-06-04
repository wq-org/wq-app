import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Text } from '@/components/ui/text'

import type { PreviewDrawerProps } from '../types/game-studio.types'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'
import { getFlowGraphNodeDisplayLabel } from '../constants/flowGraphNodeTypes'
import { GamePreviewFlow } from './GamePreviewFlow'
import { useGamePreviewSession } from './useGamePreviewSession'

export function GamePreviewDialog({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
}: PreviewDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const { steps, hasSteps } = useGamePreviewSession({ nodes, edges, open })

  const startIntro = useMemo(() => {
    const startNode = nodes.find((node) => node.type === GAME_START_TYPE)
    if (!startNode) return { title: '', description: '' }
    const data = (startNode.data ?? {}) as Record<string, unknown>
    return {
      title: getFlowGraphNodeDisplayLabel(startNode.type, data),
      description: typeof data.description === 'string' ? data.description : '',
    }
  }, [nodes])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton
        className="fixed top-[50%] left-[50%] z-50 flex h-[95vh]! max-h-[95vh]! w-[70vw]! max-w-none! -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border p-4"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-10">
          <DialogTitle>{t('previewDrawer.title')}</DialogTitle>
        </DialogHeader>

        {hasSteps ? (
          <GamePreviewFlow
            steps={steps}
            startTitle={startIntro.title}
            startDescription={startIntro.description}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center px-6">
            <Text
              as="p"
              variant="body"
              className="max-w-md text-center text-sm text-muted-foreground"
            >
              {t('previewDrawer.emptyHint')}
            </Text>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
