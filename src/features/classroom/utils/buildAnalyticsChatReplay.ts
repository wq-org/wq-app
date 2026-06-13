import type { Node } from '@xyflow/react'
import type { TFunction } from 'i18next'

import {
  GAME_IMAGE_PIN_TYPE,
  resolveGameImagePinDescription,
  type GameImagePinNodeData,
} from '@/features/game-studio/nodes/game-image-pin/image-pin.schema'
import type { GameChatHistoryMessage } from '@/features/game-studio/components/game-chat.types'
import type { GamePlayChatMessage } from '@/features/game-studio/utils/buildPlaySessionChatHistory'
import { formatGameChatMessageTime } from '@/features/game-studio/utils/formatGameChatMessageTime'

import type { GameComponentScore } from '../types/classroom-game.types'
import { parseGameRunChatHistory } from './parseGameRunChatHistory'

type SessionPayloadShape = {
  nodeChatHistories?: Record<string, GamePlayChatMessage[]>
}

function toHistoryMessage(message: GamePlayChatMessage, locale: string): GameChatHistoryMessage {
  return {
    id: message.id,
    text: message.text,
    time: formatGameChatMessageTime(message.time, locale),
    direction: message.direction,
    image: message.image
      ? {
          ...message.image,
          showTargetRect:
            message.image.variant === 'image-pin' ? true : message.image.showTargetRect,
        }
      : undefined,
    bold: message.bold,
  }
}

function getPreviewQuestions(nodeData: GameImagePinNodeData) {
  const rectangles = Array.isArray(nodeData.rectangles) ? nodeData.rectangles : []
  return rectangles.flatMap((rect) => {
    const question = String(rect.question ?? '').trim()
    if (!question) return []
    return [{ id: rect.id, question, rect }]
  })
}

/** Reconstructs Image Pin chat from node config when no stored transcript exists (legacy runs). */
function buildImagePinFallbackMessages(
  node: Node,
  imageUrl: string | undefined,
  score: number,
  submitAnswerText: string,
  pointsText: string,
  baseTime: string,
  locale: string,
): GameChatHistoryMessage[] {
  const nodeData = (node.data ?? {}) as GameImagePinNodeData
  const description = resolveGameImagePinDescription(nodeData)
  const questions = getPreviewQuestions(nodeData)
  const messages: GameChatHistoryMessage[] = []

  if (description) {
    messages.push(
      toHistoryMessage(
        {
          id: `${node.id}-description`,
          direction: 'incoming',
          text: description,
          time: baseTime,
          nodeId: node.id,
        },
        locale,
      ),
    )
  }

  for (const [index, question] of questions.entries()) {
    messages.push(
      toHistoryMessage(
        {
          id: `${node.id}-question-${index}`,
          direction: 'incoming',
          text: question.question,
          time: baseTime,
          nodeId: node.id,
          image: imageUrl
            ? {
                variant: 'image-pin',
                src: imageUrl,
                alt: 'Game Image Pin preview image',
                rect: question.rect,
                showTargetRect: true,
              }
            : undefined,
        },
        locale,
      ),
    )
    messages.push(
      toHistoryMessage(
        {
          id: `${node.id}-answer-${index}`,
          direction: 'receiving',
          text: submitAnswerText,
          time: baseTime,
          nodeId: node.id,
        },
        locale,
      ),
    )
  }

  if (score > 0 || questions.length > 0) {
    messages.push(
      toHistoryMessage(
        {
          id: `${node.id}-points`,
          direction: 'incoming',
          text: pointsText,
          time: baseTime,
          nodeId: node.id,
          bold: true,
        },
        locale,
      ),
    )
  }

  return messages
}

function isGenericImagePinPrompt(message: GamePlayChatMessage, node: Node): boolean {
  if (message.nodeId !== node.id || message.direction !== 'incoming') return false
  const label = ((node.data ?? {}) as GameImagePinNodeData).label?.trim() ?? 'Image Pin'
  const firstLine = message.text.split('\n')[0]?.trim()
  return firstLine === label || firstLine === 'Image Pin'
}

function transformLegacyMessage(
  message: GamePlayChatMessage,
  componentByNodeId: Map<string, GameComponentScore>,
  imageUrlByNodeId: Map<string, string>,
  nodesById: Map<string, Node>,
  submitAnswerText: string,
  locale: string,
  t: TFunction,
): GameChatHistoryMessage[] {
  const component = message.nodeId ? componentByNodeId.get(message.nodeId) : undefined
  const node = message.nodeId ? nodesById.get(message.nodeId) : undefined

  if (node?.type === GAME_IMAGE_PIN_TYPE && isGenericImagePinPrompt(message, node)) {
    const imageUrl = message.nodeId ? imageUrlByNodeId.get(message.nodeId) : undefined
    const score = component?.score ?? message.score ?? 0
    const pointsText = t('imagePinGamePreview.pointsEarnedMessage', {
      ns: 'features.gameStudio',
      points: score,
    })
    return buildImagePinFallbackMessages(
      node,
      imageUrl,
      score,
      submitAnswerText,
      pointsText,
      message.time,
      locale,
    )
  }

  if (message.direction === 'receiving' && component && message.nodeId) {
    const pointsText = t('pages.gameRunAnalytics.attempts.nodeScore', {
      label: message.text,
      score: component.score,
      maxScore: component.maxScore,
    })
    return [
      toHistoryMessage(
        {
          id: `${message.id}-score`,
          direction: 'incoming',
          text: pointsText,
          time: message.time,
          nodeId: message.nodeId,
          bold: true,
        },
        locale,
      ),
    ]
  }

  return [
    toHistoryMessage(
      {
        ...message,
        image:
          message.image ??
          (message.nodeId && imageUrlByNodeId.get(message.nodeId)
            ? {
                variant: 'image-pin' as const,
                src: imageUrlByNodeId.get(message.nodeId)!,
                showTargetRect: true,
              }
            : undefined),
      },
      locale,
    ),
  ]
}

type BuildAnalyticsChatReplayArgs = {
  sessionPayload: unknown
  versionContent: { nodes?: Node[] } | null | undefined
  componentScores: readonly GameComponentScore[]
  imageUrlByNodeId: Map<string, string>
  locale: string
  t: TFunction
}

/** Builds a faithful analytics chat replay from stored session data and version content. */
export function buildAnalyticsChatReplay({
  sessionPayload,
  versionContent,
  componentScores,
  imageUrlByNodeId,
  locale,
  t,
}: BuildAnalyticsChatReplayArgs): GameChatHistoryMessage[] {
  const payload =
    sessionPayload && typeof sessionPayload === 'object'
      ? (sessionPayload as SessionPayloadShape)
      : {}

  const nodeChatHistories = payload.nodeChatHistories ?? {}
  const storedMessages = parseGameRunChatHistory(sessionPayload)
  const submitAnswerText = t('imagePinGamePreview.submitAnswerPrompt', {
    ns: 'features.gameStudio',
  })

  if (Object.keys(nodeChatHistories).length > 0) {
    const ordered: GameChatHistoryMessage[] = []
    const seenNodeIds = new Set<string>()

    for (const message of storedMessages) {
      if (message.nodeId && nodeChatHistories[message.nodeId] && !seenNodeIds.has(message.nodeId)) {
        seenNodeIds.add(message.nodeId)
        for (const nodeMessage of nodeChatHistories[message.nodeId]!) {
          ordered.push(toHistoryMessage(nodeMessage, locale))
        }
        continue
      }
      if (message.nodeId && seenNodeIds.has(message.nodeId)) continue
      ordered.push(toHistoryMessage(message, locale))
    }

    for (const [nodeId, nodeMessages] of Object.entries(nodeChatHistories)) {
      if (seenNodeIds.has(nodeId)) continue
      for (const nodeMessage of nodeMessages) {
        ordered.push(toHistoryMessage(nodeMessage, locale))
      }
    }

    return ordered
  }

  const componentByNodeId = new Map(componentScores.map((row) => [row.nodeId, row]))
  const nodesById = new Map((versionContent?.nodes ?? []).map((node) => [node.id, node]))
  const skipNodeIds = new Set<string>()

  const result: GameChatHistoryMessage[] = []

  for (const message of storedMessages) {
    if (message.nodeId && skipNodeIds.has(message.nodeId)) continue

    const node = message.nodeId ? nodesById.get(message.nodeId) : undefined
    if (node?.type === GAME_IMAGE_PIN_TYPE && isGenericImagePinPrompt(message, node)) {
      skipNodeIds.add(node.id)
      const expanded = transformLegacyMessage(
        message,
        componentByNodeId,
        imageUrlByNodeId,
        nodesById,
        submitAnswerText,
        locale,
        t,
      )
      result.push(...expanded)
      continue
    }

    if (message.direction === 'receiving' && message.nodeId && skipNodeIds.has(message.nodeId)) {
      continue
    }

    result.push(
      ...transformLegacyMessage(
        message,
        componentByNodeId,
        imageUrlByNodeId,
        nodesById,
        submitAnswerText,
        locale,
        t,
      ),
    )
  }

  return result
}
