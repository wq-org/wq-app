'use client'

import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import type { GameIfElseNodeData } from './game-if-else.schema'
import { IfElseBeamMap } from './IfElseBeamMap'
import { IfElseScoreThresholdField } from './IfElseScoreThresholdField'

export type GameIfElseSettingsProps = {
  nodeId: string
  onDelete: () => void
  onClose: () => void
  onNavigateToNode?: (nodeId: string) => void
  onPatchNodeData: (patch: Partial<GameIfElseNodeData>) => void
  nodeData: GameIfElseNodeData
  flowNodes?: Node[]
  flowEdges?: Edge[]
}

export function GameIfElseSettings({
  nodeId,
  onDelete,
  onClose,
  onNavigateToNode,
  onPatchNodeData,
  nodeData,
  flowNodes = [],
  flowEdges = [],
}: GameIfElseSettingsProps) {
  const { t } = useTranslation('features.gameStudio')

  function handleNavigate(target: { id: string }) {
    onClose()
    onNavigateToNode?.(target.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <Text
        as="p"
        bold
      >
        {t('ifElseSettings.title')}
      </Text>

      <IfElseScoreThresholdField
        nodeId={nodeId}
        nodeData={nodeData}
        flowNodes={flowNodes}
        flowEdges={flowEdges}
        onPatchNodeData={onPatchNodeData}
      />

      <Separator />

      <IfElseBeamMap
        nodeId={nodeId}
        nodeData={nodeData}
        flowNodes={flowNodes}
        flowEdges={flowEdges}
        onNavigate={handleNavigate}
      />

      <Separator />

      <HoldToDeleteButton
        className="self-start"
        onDelete={onDelete}
      >
        {t('ifElseDialog.deleteHint')}
      </HoldToDeleteButton>
    </div>
  )
}
