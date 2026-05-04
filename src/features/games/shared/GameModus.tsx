import type { Node } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { ContainerSlider } from '@/components/shared'
import { StatsDisplay } from '@/features/games/shared/StatsDisplay'
import { NODE_TYPE_TO_GAME } from './nodeTypeToGame'
import { Text } from '@/components/ui/text'

export interface GameModusProps {
  /** Playable game nodes only (gameImagePin), in flow order. */
  nodes: Node[]
  className?: string
}

export function GameModus({ nodes, className }: GameModusProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <Text
          as="p"
          variant="body"
        >
          Add game nodes to the flow to play.
        </Text>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6 flex-1 min-h-0', className)}>
      <div className="flex justify-center shrink-0">
        <StatsDisplay value={0} />
      </div>
      <ContainerSlider fillHeight>
        {nodes.map((node) => {
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
      </ContainerSlider>
    </div>
  )
}
