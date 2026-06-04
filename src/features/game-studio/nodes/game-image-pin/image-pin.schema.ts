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
  /** `cloud_files.id` for inline_media usage tracking and delete guards. */
  cloudFileId?: string | null
  rectangles?: GameImagePinRect[]
  /** Optional aggregate score for publish / analytics until per-rect scoring exists. */
  points?: number
  /** Percentage removed from a question's available points on each retry. */
  retryDeductionPercent?: number
}

export const GAME_IMAGE_PIN_TYPE = 'gameImagePin' as const
export const GAME_IMAGE_PIN_DEFAULT_POINTS = 100
export const GAME_IMAGE_PIN_DEFAULT_RETRY_DEDUCTION_PERCENT = 10

export const gameImagePinDefaultConfig: GameImagePinNodeData = {
  label: 'Image Pin',
  title: '',
  description: '',
  rectangles: [],
  points: GAME_IMAGE_PIN_DEFAULT_POINTS,
  retryDeductionPercent: GAME_IMAGE_PIN_DEFAULT_RETRY_DEDUCTION_PERCENT,
}

export function resolveGameImagePinDescription(data: unknown): string {
  const description = (data as GameImagePinNodeData | null | undefined)?.description
  return typeof description === 'string' ? description.trim() : ''
}

export function resolveGameImagePinPoints(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : GAME_IMAGE_PIN_DEFAULT_POINTS
}

export function resolveGameImagePinRetryDeductionPercent(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.min(100, Math.floor(value))
    : GAME_IMAGE_PIN_DEFAULT_RETRY_DEDUCTION_PERCENT
}

export function getMissingGameImagePinDefaults(
  data: GameImagePinNodeData,
): Partial<GameImagePinNodeData> {
  const patch: Partial<GameImagePinNodeData> = {}

  if (
    typeof data.points !== 'number' ||
    !Number.isFinite(data.points) ||
    data.points < 0 ||
    data.points !== Math.floor(data.points)
  ) {
    patch.points = GAME_IMAGE_PIN_DEFAULT_POINTS
  }

  if (
    typeof data.retryDeductionPercent !== 'number' ||
    !Number.isFinite(data.retryDeductionPercent) ||
    data.retryDeductionPercent < 0 ||
    data.retryDeductionPercent > 100 ||
    data.retryDeductionPercent !== Math.floor(data.retryDeductionPercent)
  ) {
    patch.retryDeductionPercent = GAME_IMAGE_PIN_DEFAULT_RETRY_DEDUCTION_PERCENT
  }

  return patch
}

export { validateGameImagePinConfig } from './utils/validateGameImagePinPublish'
