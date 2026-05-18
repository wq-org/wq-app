/**
 * One drawable region on the image pin bitmap.
 * Coordinates are in the image's natural pixel space (same as Konva scene width/height).
 * For durable backend storage, normalize to ratios (e.g. x / imageWidth) before persisting to Supabase.
 */
export type GameImagePinRect = {
  id: string
  x: number
  y: number
  width: number
  height: number
  /** Question copy for this region (publish validation requires at least one non-empty). */
  question?: string
}

export type GameImagePinNodeData = {
  label?: string
  title?: string
  description?: string
  imagePreview?: string
  filepath?: string
  rectangles?: GameImagePinRect[]
  /** Optional aggregate score for publish / analytics until per-rect scoring exists. */
  points?: number
  /** Percentage removed from a question's available points on each retry. */
  retryDeductionPercent?: number
}

export const GAME_IMAGE_PIN_TYPE = 'gameImagePin' as const

export const gameImagePinDefaultConfig: GameImagePinNodeData = {
  label: 'Image Pin',
  title: '',
  description: '',
  rectangles: [],
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
  const rectangles = Array.isArray(d.rectangles) ? d.rectangles : []
  if (rectangles.length < 1) {
    errors.push('No rectangles')
    return errors
  }
  const hasValidRect = rectangles.some(
    (r) =>
      typeof r.x === 'number' &&
      typeof r.y === 'number' &&
      typeof r.width === 'number' &&
      typeof r.height === 'number' &&
      r.width > 0 &&
      r.height > 0,
  )
  if (!hasValidRect) errors.push('Invalid rectangle geometry')
  const hasQuestion = rectangles.some((r) => String(r.question ?? '').trim() !== '')
  if (!hasQuestion) errors.push('Missing question text')
  return errors
}
