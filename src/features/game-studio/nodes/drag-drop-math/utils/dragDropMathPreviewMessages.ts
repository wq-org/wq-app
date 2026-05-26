export type DragDropMathPreviewPromptMessage = {
  id: string
  direction: 'sending' | 'receiving'
  text: string
}

export function buildDragDropMathHowToPlayResponse(
  scoringResponse: string,
  gameplayResponse: string,
): string {
  return `${scoringResponse}\n\n${gameplayResponse}`
}
