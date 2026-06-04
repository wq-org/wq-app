'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { Text } from '@/components/ui/text'

import { getFlowGraphNodeDisplayLabel } from '../../constants/flowGraphNodeTypes'
import { getRegistryEntry } from '../_registry/GameNodeRegistry'
import type { GameIfElseNodeData } from './game-if-else.schema'
import { getIncomingGameplayNode } from './game-if-else.utils'

export type GameIfElsePreviewProps = {
  nodeId: string
  nodeData: GameIfElseNodeData
  flowNodes?: Node[]
  flowEdges?: Edge[]
}

export function GameIfElsePreview({
  nodeId,
  flowNodes = [],
  flowEdges = [],
}: GameIfElsePreviewProps) {
  const { t } = useTranslation('features.gameStudio')

  const incomingNode = useMemo(
    () => getIncomingGameplayNode(nodeId, flowNodes, flowEdges),
    [flowEdges, flowNodes, nodeId],
  )

  const incomingEntry = incomingNode?.type ? getRegistryEntry(incomingNode.type) : undefined
  const IncomingPreview = incomingEntry?.PreviewComponent ?? null
  const incomingLabel = incomingNode
    ? getFlowGraphNodeDisplayLabel(
        incomingNode.type,
        (incomingNode.data ?? {}) as Record<string, unknown>,
      )
    : ''

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Text
        as="p"
        variant="small"
        muted
      >
        {t('ifElsePreview.playIncomingHint')}
      </Text>

      {!incomingNode || !IncomingPreview ? (
        <Text
          as="p"
          variant="small"
          className="text-amber-700 dark:text-amber-400"
        >
          {t('ifElsePreview.noIncoming')}
        </Text>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Text
            as="p"
            variant="small"
            bold
          >
            {incomingLabel}
          </Text>
          <div className="flex min-h-[28rem] flex-1 flex-col">
            <IncomingPreview
              nodeId={incomingNode.id}
              nodeData={(incomingNode.data ?? {}) as Record<string, unknown>}
              embedded
            />
          </div>
        </div>
      )}
    </div>
  )
}
