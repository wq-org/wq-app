import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PreviewDrawerProps } from '../types/game-studio.types'
import { ContainerSlider } from '@/components/shared'
import { StatsDisplay } from '@/features/games/shared/StatsDisplay'
import { NODE_TYPE_TO_GAME } from '@/features/games/shared/nodeTypeToGame'
import { getPreviewPath } from '../utils/flowOrder'
import { PreviewStartEndSlide } from './PreviewStartEndSlide'
import { PreviewIfElseSlide } from './PreviewIfElseSlide'
import type { Node, Edge } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

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

function getNodeLabel(node?: Node | null): string {
  if (!node) return ''
  const data = node.data as Record<string, unknown> | undefined
  const label =
    (typeof data?.label === 'string' && data.label.trim() ? data.label : null) ??
    (typeof data?.title === 'string' && data.title.trim() ? data.title : null) ??
    ''
  return label || node.id
}

function getIfElseBranches(nodeId: string, nodes: Node[], edges: Edge[]) {
  const outgoingEdges = edges.filter((e) => e.source === nodeId)
  const branches: { A?: string; B?: string } = {}
  outgoingEdges.forEach((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target)
    const label = getNodeLabel(targetNode)
    const handleId = edge.sourceHandle ?? ''
    if (handleId === 'right-top') branches.A = label
    if (handleId === 'right-bottom') branches.B = label
  })
  return branches
}

export default function PreviewDrawer({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
}: PreviewDrawerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const path = useMemo(() => getPreviewPath(nodes, edges), [nodes, edges])
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
            <DialogTitle>Game Simulation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
            <Text as="p" variant="body">Add a Start node, game nodes, and an End node connected in a path to preview.</Text>
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
          <DialogTitle>Game Simulation</DialogTitle>
        </DialogHeader>
        <div className={cn('overflow-auto flex-1 flex flex-col min-h-0 p-4 space-y-4')}>
          <div className="flex justify-center shrink-0">
            <StatsDisplay
              correctAnswers={0}
              wrongAnswers={0}
              score={0}
            />
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
                label="Start"
                drawerOpen={open}
              />
            )}
            {pathNodes.map((node: Node) => {
              if (node.type === 'gameIfElse') {
                const data = node.data as Record<string, unknown> | undefined
                const title =
                  (typeof data?.title === 'string' && data.title.trim() ? data.title : null) ??
                  (typeof data?.label === 'string' && data.label.trim() ? data.label : null) ??
                  'If / else'
                const description =
                  typeof data?.description === 'string' ? data.description : undefined
                const condition = typeof data?.condition === 'string' ? data.condition : undefined
                const correctPath = (data?.correctPath as 'A' | 'B' | undefined) ?? 'A'
                return (
                  <div
                    key={node.id}
                    className="p-4"
                  >
                    <PreviewIfElseSlide
                      title={title}
                      description={description}
                      condition={condition}
                      correctPath={correctPath}
                      branches={getIfElseBranches(node.id, nodes, edges)}
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
                  />
                </div>
              )
            })}
            {endNode && (
              <PreviewStartEndSlide
                title={endData.title}
                description={endData.description}
                active={endActive}
                label="End"
                drawerOpen={open}
              />
            )}
          </ContainerSlider>
        </div>
      </DialogContent>
    </Dialog>
  )
}