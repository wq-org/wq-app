import { useState, useMemo } from 'react'
import { useGamePlayState } from '@/contexts/game-play'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PreviewDrawerProps } from '../types/game-studio.types'
import { ContainerSlider } from '@/components/shared'
import { StatsDisplay } from '@/features/games/shared/StatsDisplay'
import { NODE_TYPE_TO_GAME } from '@/features/games/shared/nodeTypeToGame'
import { getSessionPath, resolveIfElseNode } from '../utils/flowOrder'
import { PreviewStartEndSlide } from './PreviewStartEndSlide'
import { PreviewIfElseSlide } from './PreviewIfElseSlide'
import type { Node } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

function getTitleAndDescription(data: Record<string, unknown> | undefined): {
  title: string
  description: string
} {
  if (!data) return { title: '', description: '' }
  const title =
    (typeof data.title === 'string' && data.title.trim() ? data.title : null) ??
    (typeof data.label === 'string' && data.label.trim() ? data.label : null) ??
    ''
  const description = typeof data.description === 'string' ? data.description : ''
  return { title, description }
}

export function PreviewDrawer({ open, onOpenChange, nodes = [], edges = [] }: PreviewDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [currentIndex, setCurrentIndex] = useState(0)
  const simulationState = useGamePlayState()

  const path = useMemo(
    () => getSessionPath(nodes, edges, simulationState.resultsByNode),
    [edges, nodes, simulationState.resultsByNode],
  )
  const { startNode, pathNodes, endNode } = path

  const slideCount = (startNode ? 1 : 0) + pathNodes.length + (endNode ? 1 : 0)
  const startActive = startNode ? currentIndex === 0 : false
  const endActive = endNode ? currentIndex === slideCount - 1 : false

  const startData = getTitleAndDescription(startNode?.data as Record<string, unknown> | undefined)
  const endData = getTitleAndDescription(endNode?.data as Record<string, unknown> | undefined)

  if (slideCount === 0) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          showCloseButton
          className="fixed top-[50%] left-[50%] z-50 w-[70vw]! max-w-none! h-[95vh]! max-h-[95vh]! -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 flex flex-col gap-4 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <DialogHeader className="flex  flex-row items-center justify-between space-y-0 pr-10">
            <DialogTitle>{t('previewDrawer.title')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
            <Text
              as="p"
              variant="body"
            >
              {t('previewDrawer.emptyHint')}
            </Text>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton
        className="fixed top-[50%] left-[50%] z-50 w-[70vw]! max-w-none! h-[95vh]! max-h-[95vh]! -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 flex flex-col gap-4 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
      >
        <DialogHeader className="flex     flex-row items-center justify-between space-y-0 pr-10">
          <DialogTitle>{t('previewDrawer.title')}</DialogTitle>
        </DialogHeader>
        <div className={cn('overflow-auto flex-1 flex flex-col min-h-0 p-4 space-y-4')}>
          <div className="flex justify-center shrink-0">
            <StatsDisplay value={simulationState.correctAnswers} />
          </div>
          <ContainerSlider
            fillHeight
            onIndexChange={setCurrentIndex}
            className="flex-1 min-h-0"
          >
            {startNode && (
              <PreviewStartEndSlide
                title={startData.title}
                description={startData.description}
                active={startActive}
                label={t('previewDrawer.labels.start')}
                drawerOpen={open}
              />
            )}
            {pathNodes.map((node: Node) => {
              if (node.type === 'gameIfElse') {
                const data = node.data as Record<string, unknown> | undefined
                const title =
                  (typeof data?.title === 'string' && data.title.trim() ? data.title : null) ??
                  (typeof data?.label === 'string' && data.label.trim() ? data.label : null) ??
                  t('previewDrawer.ifElseFallback')
                const description =
                  typeof data?.description === 'string' ? data.description : undefined
                const resolution = resolveIfElseNode(
                  node,
                  nodes,
                  edges,
                  simulationState.resultsByNode,
                )
                return (
                  <div
                    key={node.id}
                    className="p-4"
                  >
                    <PreviewIfElseSlide
                      title={title}
                      description={description}
                      message={resolution.message ?? undefined}
                      alertState={resolution.blockReason}
                    />
                  </div>
                )
              }

              const GameComponent = NODE_TYPE_TO_GAME[node.type ?? '']
              if (!GameComponent) return null
              return (
                <div
                  key={node.id}
                  className="p-4"
                >
                  <GameComponent
                    initialData={node.data}
                    previewOnly
                    onResultsRevealed={(correct, wrong, score) =>
                      simulationState.reportResult(node.id, correct, wrong, score)
                    }
                  />
                </div>
              )
            })}
            {endNode && (
              <PreviewStartEndSlide
                title={endData.title}
                description={endData.description}
                active={endActive}
                label={t('previewDrawer.labels.end')}
                drawerOpen={open}
              />
            )}
          </ContainerSlider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
