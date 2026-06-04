'use client'

import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@xyflow/react'

import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { GameIfElseNodeData } from './game-if-else.schema'
import { IfElseBeamMap } from './IfElseBeamMap'
import { IfElseScoreThresholdField } from './IfElseScoreThresholdField'

const ifElseSettingsEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const ifElseSettingsEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

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
    <div className={cn('flex min-h-0 flex-1 flex-col gap-6', ifElseSettingsEnterLift)}>
      <Text
        as="p"
        bold
      >
        {t('ifElseSettings.title')}
      </Text>

      <div className={ifElseSettingsEnterSubtle}>
        <IfElseScoreThresholdField
          nodeId={nodeId}
          nodeData={nodeData}
          flowNodes={flowNodes}
          flowEdges={flowEdges}
          onPatchNodeData={onPatchNodeData}
        />
      </div>

      <Separator />

      <div className={cn(ifElseSettingsEnterSubtle, 'motion-safe:delay-75')}>
        <IfElseBeamMap
          nodeId={nodeId}
          nodeData={nodeData}
          flowNodes={flowNodes}
          flowEdges={flowEdges}
          onNavigate={handleNavigate}
        />
      </div>

      <Separator />

      <div className={cn(ifElseSettingsEnterSubtle, 'motion-safe:delay-150')}>
        <HoldToDeleteButton
          className="self-start"
          onDelete={onDelete}
        >
          {t('ifElseDialog.deleteHint')}
        </HoldToDeleteButton>
      </div>
    </div>
  )
}
