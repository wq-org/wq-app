import type { PublishIssue } from '../../../types/publish-validation.types'
import { IMAGE_PIN_RECT_MIN_SIZE } from '../imagePinRectGeometry'
import {
  type GameImagePinNodeData,
  type GameImagePinRect,
  resolveGameImagePinDescription,
  resolveGameImagePinPoints,
  resolveGameImagePinRetryDeductionPercent,
} from '../image-pin.schema'

function isValidRectGeometry(rect: GameImagePinRect): boolean {
  return (
    typeof rect.x === 'number' &&
    Number.isFinite(rect.x) &&
    typeof rect.y === 'number' &&
    Number.isFinite(rect.y) &&
    typeof rect.width === 'number' &&
    Number.isFinite(rect.width) &&
    typeof rect.height === 'number' &&
    Number.isFinite(rect.height) &&
    rect.width >= IMAGE_PIN_RECT_MIN_SIZE &&
    rect.height >= IMAGE_PIN_RECT_MIN_SIZE
  )
}

function hasImageSource(data: GameImagePinNodeData): boolean {
  return Boolean(
    (typeof data.imagePreview === 'string' && data.imagePreview.trim()) ||
      (typeof data.filepath === 'string' && data.filepath.trim()) ||
      (typeof data.cloudFileId === 'string' && data.cloudFileId.trim()),
  )
}

export function validateGameImagePinPublish(data: unknown): PublishIssue[] {
  const issues: PublishIssue[] = []
  const d = (data ?? {}) as GameImagePinNodeData

  if (!hasImageSource(d)) {
    issues.push({ code: 'imagePin.image.missing', severity: 'error' })
  }

  if (!resolveGameImagePinDescription(d)) {
    issues.push({ code: 'imagePin.meta.incomplete', severity: 'warning' })
  }

  const rectangles = Array.isArray(d.rectangles) ? d.rectangles : []
  if (rectangles.length === 0) {
    issues.push({ code: 'imagePin.rect.none', severity: 'error' })
  }

  for (const rect of rectangles) {
    if (!isValidRectGeometry(rect)) {
      issues.push({
        code: 'imagePin.rect.invalidGeometry',
        severity: 'error',
        rectId: rect.id,
        params: { rectIndex: rectangles.indexOf(rect) + 1 },
      })
    }

    if (!String(rect.question ?? '').trim()) {
      issues.push({
        code: 'imagePin.rect.missingQuestion',
        severity: 'error',
        rectId: rect.id,
        params: { rectIndex: rectangles.indexOf(rect) + 1 },
      })
    }
  }

  const points = resolveGameImagePinPoints(d.points)
  if (
    typeof d.points === 'number' &&
    (!Number.isFinite(d.points) || d.points < 0 || d.points !== Math.floor(d.points))
  ) {
    issues.push({ code: 'imagePin.points.invalid', severity: 'error' })
  } else if (points < 0) {
    issues.push({ code: 'imagePin.points.invalid', severity: 'error' })
  }

  const retryDeduction = resolveGameImagePinRetryDeductionPercent(d.retryDeductionPercent)
  if (
    typeof d.retryDeductionPercent === 'number' &&
    (d.retryDeductionPercent !== retryDeduction ||
      d.retryDeductionPercent < 0 ||
      d.retryDeductionPercent > 100)
  ) {
    issues.push({ code: 'imagePin.retryDeduction.invalid', severity: 'warning' })
  }

  return issues
}

/** Registry and schema re-export. */
export function validateGameImagePinConfig(data: unknown): PublishIssue[] {
  return validateGameImagePinPublish(data)
}
