export type ImagePinSquare = {
  question?: string
  points?: number
  pointsWhenWrong?: number
}

export type GameImagePinNodeData = {
  label?: string
  title?: string
  description?: string
  imagePreview?: string
  filepath?: string
  squares?: ImagePinSquare[]
  points?: number
}

export const GAME_IMAGE_PIN_TYPE = 'gameImagePin' as const

export const gameImagePinDefaultConfig: GameImagePinNodeData = {
  label: 'Image Pin',
  title: '',
  description: '',
  squares: [],
}

export function validateGameImagePinConfig(data: unknown): string[] {
  const errors: string[] = []
  const d = (data ?? {}) as GameImagePinNodeData
  if (!String(d.title ?? '').trim()) errors.push('Missing title')
  if (!String(d.description ?? '').trim()) errors.push('Missing description')
  const hasImage = Boolean(
    (typeof d.imagePreview === 'string' && d.imagePreview.trim()) ||
      (typeof d.filepath === 'string' && d.filepath.trim()),
  )
  if (!hasImage) errors.push('Missing image')
  const squares = Array.isArray(d.squares) ? d.squares : []
  if (squares.length < 1) {
    errors.push('No squares')
    return errors
  }
  const hasValidSquare = squares.some(
    (s) =>
      String(s.question ?? '').trim() !== '' &&
      typeof s.points === 'number' &&
      (typeof s.pointsWhenWrong === 'number' || s.pointsWhenWrong === undefined),
  )
  if (!hasValidSquare) {
    const hasQuestion = squares.some((s) => String(s.question ?? '').trim() !== '')
    const hasPoints = squares.some(
      (s) =>
        typeof s.points === 'number' &&
        (typeof s.pointsWhenWrong === 'number' || s.pointsWhenWrong === undefined),
    )
    if (!hasQuestion) errors.push('Missing question text')
    if (!hasPoints) errors.push('Missing points')
  }
  return errors
}
