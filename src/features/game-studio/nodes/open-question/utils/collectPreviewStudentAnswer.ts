import type { OpenQuestionPreviewChatMessage } from '../components/OpenQuestionPreviewChatHistory'

/** Latest learner text from preview chat, excluding badge/system prompts. */
export function collectPreviewStudentAnswer(
  messages: readonly OpenQuestionPreviewChatMessage[],
  excludedPrompts: ReadonlySet<string>,
): string {
  const learnerMessages = messages.filter(
    (message) =>
      message.direction === 'sending' &&
      message.text.trim().length > 0 &&
      !excludedPrompts.has(message.text),
  )

  if (learnerMessages.length === 0) return ''

  return learnerMessages[learnerMessages.length - 1].text.trim()
}
