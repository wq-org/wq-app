import type { GameChatHistoryMessage } from '../../components/game-chat.types'
import type { GamePlayChatMessage } from '../../utils/buildPlaySessionChatHistory'
import type { ImagePinSubmission } from '../hooks/useImagePinGame'

/** Converts live Image Pin preview messages into a JSON-safe transcript for session_payload. */
export function buildPersistedImagePinChatMessages(
  nodeId: string,
  messages: readonly GameChatHistoryMessage[],
  submissions: Record<string, ImagePinSubmission>,
  time: string,
): GamePlayChatMessage[] {
  return messages.map((message) => {
    const submission = submissions[message.id]
    const image = message.image
      ? {
          ...message.image,
          showTargetRect: true,
          ...(submission
            ? {
                pinDrop: submission.drop,
                pinVariant: submission.variant,
              }
            : {}),
        }
      : undefined

    return {
      id: message.id,
      direction: message.direction,
      text: message.text,
      time,
      nodeId,
      image,
      bold: message.bold,
    }
  })
}
