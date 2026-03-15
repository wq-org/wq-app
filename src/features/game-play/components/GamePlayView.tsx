import { useEffect, useMemo, useRef, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import confetti from 'canvas-confetti'
import { ContainerSlider } from '@/components/shared'
import { StatsDisplay } from '@/features/games/shared/StatsDisplay'
import { NODE_TYPE_TO_GAME } from '@/features/games/shared/nodeTypeToGame'
import {
  getSessionPath,
  resolveIfElseNode,
  PreviewStartEndSlide,
  PreviewIfElseSlide,
} from '@/features/game-studio'
import { useGamePlay } from '@/contexts/game-play'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { DoorOpen } from 'lucide-react'

export interface GamePlayViewProps {
  nodes: Node[]
  edges: Edge[]
  correctAnswers?: number
  wrongAnswers?: number
  score?: number
  /** When set, a Leave button is shown on the left of the stats row (e.g. from PlayGamePage). */
  onBack?: () => void
}

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

function isPlayableNodeType(type: string | undefined) {
  return type === 'gameParagraph' || type === 'gameImageTerms' || type === 'gameImagePin'
}

export function GamePlayView({
  nodes,
  edges,
  correctAnswers: correctProp = 0,
  wrongAnswers: wrongProp = 0,
  onBack,
}: GamePlayViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const gamePlay = useGamePlay()
  const confettiTriggeredRef = useRef(false)
  const correctAnswers = gamePlay ? gamePlay.correctAnswers : correctProp
  const wrongAnswers = gamePlay ? gamePlay.wrongAnswers : wrongProp
  const resultsByNode = gamePlay?.resultsByNode ?? {}

  const path = useMemo(
    () => getSessionPath(nodes, edges, resultsByNode),
    [edges, nodes, resultsByNode],
  )
  const { startNode, pathNodes, endNode } = path

  const slideCount = (startNode ? 1 : 0) + pathNodes.length + (endNode ? 1 : 0)
  const startActive = startNode ? currentIndex === 0 : false
  const endActive = endNode ? currentIndex === slideCount - 1 : false
  const playableNodes = pathNodes.filter((node) => isPlayableNodeType(node.type))

  const startData = getTitleAndDescription(startNode?.data as Record<string, unknown> | undefined)
  const endData = getTitleAndDescription(endNode?.data as Record<string, unknown> | undefined)

  useEffect(() => {
    if (!endActive || !endNode || confettiTriggeredRef.current || wrongAnswers > 0) return
    if (playableNodes.length === 0) return

    const hasResultsForAllPlayableNodes = playableNodes.every((node) => resultsByNode[node.id])
    if (!hasResultsForAllPlayableNodes) return

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    })
    confettiTriggeredRef.current = true
  }, [endActive, endNode, playableNodes, resultsByNode, wrongAnswers])

  if (slideCount === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
        <Text
          as="p"
          variant="body"
        >
          This game has no playable path. Add a Start node, game nodes, and an End node connected in
          a path.
        </Text>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-1 flex-col min-h-0 p-4 space-y-4')}>
      <div className="flex items-center gap-4 shrink-0">
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2 shrink-0"
          >
            <DoorOpen className="h-4 w-4 mr-2" />
            Leave
          </Button>
        )}
        <div className="flex-1 flex justify-center min-w-0">
          <StatsDisplay value={correctAnswers} />
        </div>
        {onBack && (
          <div
            className="w-[88px] shrink-0"
            aria-hidden
          />
        )}
      </div>
      <ContainerSlider
        fillHeight
        onIndexChange={setCurrentIndex}
        className="flex-1 min-h-0"
        showSideArrows
      >
        {startNode && (
          <PreviewStartEndSlide
            title={startData.title}
            description={startData.description}
            active={startActive}
            label="Start"
          />
        )}
        {pathNodes.map((node: Node) => {
          if (node.type === 'gameIfElse') {
            const data = node.data as Record<string, unknown> | undefined
            const title =
              (typeof data?.title === 'string' && data.title.trim() ? data.title : null) ??
              (typeof data?.label === 'string' && data.label.trim() ? data.label : null) ??
              'If / else'
            const description = typeof data?.description === 'string' ? data.description : undefined
            const resolution = resolveIfElseNode(node, nodes, edges, resultsByNode)
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
          const onResultsRevealed = gamePlay
            ? (correct: number, wrong: number, scoreValue: number) => {
                gamePlay.reportResult(node.id, correct, wrong, scoreValue)
              }
            : undefined
          const lockSelectionAfterReveal = !!onResultsRevealed
          return (
            <div
              key={node.id}
              className="p-4"
            >
              <GameComponent
                initialData={node.data}
                previewOnly={false}
                playMode={true}
                onResultsRevealed={onResultsRevealed}
                lockSelectionAfterReveal={lockSelectionAfterReveal}
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
          />
        )}
      </ContainerSlider>
    </div>
  )
}
