'use client'

import type { Node } from '@xyflow/react'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { getRegistryEntry } from '../_registry/GameNodeRegistry'
import type { GameNodePreviewSessionCompletePayload } from '../_registry/game-node-registry.types'

export type IfElseEmbeddedNodePreviewProps = {
  flowNode: Node | undefined
  sessionActive: boolean
  playKey: string
  missingLabel: string
  onSessionComplete?: (payload: GameNodePreviewSessionCompletePayload) => void
  onSessionScoreChange?: (score: number) => void
}

export function IfElseEmbeddedNodePreview({
  flowNode,
  sessionActive,
  playKey,
  missingLabel,
  onSessionComplete,
  onSessionScoreChange,
}: IfElseEmbeddedNodePreviewProps) {
  const entry = flowNode?.type ? getRegistryEntry(flowNode.type) : undefined
  const PreviewComponent = entry?.PreviewComponent ?? null

  if (!flowNode || !PreviewComponent) {
    return (
      <Text
        as="p"
        variant="small"
        className="text-amber-700 dark:text-amber-400"
      >
        {missingLabel}
      </Text>
    )
  }

  return (
    <div
      className={cn('flex flex-col', !sessionActive && 'pointer-events-none select-none')}
      aria-hidden={!sessionActive}
    >
      <PreviewComponent
        key={`${flowNode.id}-${playKey}`}
        nodeId={flowNode.id}
        nodeData={(flowNode.data ?? {}) as Record<string, unknown>}
        embedded
        continuousSession
        sessionActive={sessionActive}
        onSessionComplete={sessionActive ? onSessionComplete : undefined}
        onSessionScoreChange={sessionActive ? onSessionScoreChange : undefined}
      />
    </div>
  )
}
