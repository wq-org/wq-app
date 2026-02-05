import type { ComponentType } from 'react'
import type { Node } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { ContainerSlider } from '@/components/shared'
import { StatsDisplay } from '@/features/games/components/StatsDisplay'
import ParagraphLineSelectGame from '@/features/games/paragraph-line-select/ParagraphLineSelectGame'
import ImageTermMatchGame from '@/features/games/image-term-match/ImageTermMatchGame'
import ImagePinMarkGame from '@/features/games/image-pin-mark/ImagePinMarkGame'

const NODE_TYPE_TO_GAME: Record<
  string,
  ComponentType<{ initialData?: unknown; previewOnly?: boolean }>
> = {
  gameParagraph: ParagraphLineSelectGame,
  gameImageTerms: ImageTermMatchGame,
  gameImagePin: ImagePinMarkGame,
}

export interface GameModusProps {
  /** Playable game nodes only (gameParagraph, gameImageTerms, gameImagePin), in flow order. */
  nodes: Node[]
  className?: string
}

export function GameModus({ nodes, className }: GameModusProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <p>Add game nodes to the flow to play.</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6 flex-1 min-h-0', className)}>
      <div className="flex justify-center shrink-0">
        <StatsDisplay correctAnswers={0} wrongAnswers={0} score={0} />
      </div>
      <ContainerSlider fillHeight>
        {nodes.map((node) => {
          const GameComponent = NODE_TYPE_TO_GAME[node.type ?? '']
          if (!GameComponent) return null
          return (
            <div key={node.id} className="p-4">
              <GameComponent
                initialData={node.data}
                previewOnly
              />
            </div>
          )
        })}
      </ContainerSlider>
    </div>
  )
}
