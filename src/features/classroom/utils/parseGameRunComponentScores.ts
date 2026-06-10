import type { Edge, Node } from '@xyflow/react'

import { isGameplayNodeType } from '@/features/game-studio/constants/flowGraphNodeTypes'
import { getRegistryEntry } from '@/features/game-studio/nodes/_registry/GameNodeRegistry'
import {
  GAME_IMAGE_PIN_TYPE,
  type GameImagePinNodeData,
} from '@/features/game-studio/nodes/game-image-pin/image-pin.schema'
import { resolveGameplayNodeMaxPoints } from '@/features/game-studio/nodes/game-if-else/game-if-else.utils'

import type { GameComponentScore } from '../types/classroom-game.types'

type LegacyScoreDetailRow = {
  node_id?: string
  total?: number
  score?: number
}

type SessionResultsByNode = Record<
  string,
  {
    score?: number
  }
>

type SessionPayloadShape = {
  resultsByNode?: SessionResultsByNode
  nodes?: LegacyScoreDetailRow[]
  scores?: LegacyScoreDetailRow[]
}

function looksLikeGeneratedNodeId(value: string): boolean {
  return /^game\w+-\d+$/i.test(value.trim())
}

function resolveNodeLabel(node: Node): string {
  const data = (node.data ?? {}) as { label?: string; title?: string }
  const customLabel = data.label?.trim()
  const customTitle = data.title?.trim()

  if (customLabel && !looksLikeGeneratedNodeId(customLabel)) return customLabel
  if (customTitle && !looksLikeGeneratedNodeId(customTitle)) return customTitle

  const entry = getRegistryEntry(node.type)
  if (entry) return entry.label

  return node.type ?? node.id
}

function resolveImagePinAssets(
  node: Node,
): Pick<GameComponentScore, 'imagePreview' | 'imageFilepath'> {
  if (node.type !== GAME_IMAGE_PIN_TYPE) return {}

  const data = node.data as GameImagePinNodeData
  const imagePreview = data.imagePreview?.trim()
  const imageFilepath = data.filepath?.trim()

  return {
    imagePreview: imagePreview || undefined,
    imageFilepath: imageFilepath || undefined,
  }
}

function readScoreFromPayload(payload: SessionPayloadShape, nodeId: string): number | undefined {
  const fromResults = payload.resultsByNode?.[nodeId]?.score
  if (typeof fromResults === 'number') return fromResults

  const rows = payload.nodes ?? payload.scores ?? []
  const match = rows.find((row) => row.node_id === nodeId)
  if (!match) return undefined
  if (typeof match.total === 'number') return match.total
  if (typeof match.score === 'number') return match.score
  return undefined
}

export function parseGameRunComponentScores(
  sessionPayload: unknown,
  versionContent: { nodes?: Node[]; edges?: Edge[] } | null | undefined,
): GameComponentScore[] {
  const nodes = (versionContent?.nodes ?? []).filter((node) => isGameplayNodeType(node.type))
  if (nodes.length === 0) return []

  const payload =
    sessionPayload && typeof sessionPayload === 'object'
      ? (sessionPayload as SessionPayloadShape)
      : {}

  return nodes.map((node) => {
    const maxScore = resolveGameplayNodeMaxPoints(node)
    const rawScore = readScoreFromPayload(payload, node.id)
    const score = typeof rawScore === 'number' ? rawScore : 0

    return {
      nodeId: node.id,
      nodeType: node.type ?? 'unknown',
      label: resolveNodeLabel(node),
      score,
      maxScore,
      ...resolveImagePinAssets(node),
    }
  })
}

export function sumComponentScores(components: readonly GameComponentScore[]): {
  totalScore: number
  maxTotalScore: number
} {
  return components.reduce(
    (acc, row) => ({
      totalScore: acc.totalScore + row.score,
      maxTotalScore: acc.maxTotalScore + row.maxScore,
    }),
    { totalScore: 0, maxTotalScore: 0 },
  )
}
