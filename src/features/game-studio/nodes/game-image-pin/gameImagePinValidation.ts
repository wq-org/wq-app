import type { GameImagePinRect } from './game-image-pin.schema'

/** Pin bounding box in 0..1 image coordinates. */
export type NormalizedPinBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

/** Pin's centre point in 0..1 image coordinates. */
export type NormalizedPinPoint = { x: number; y: number }

export type ImagePinSubmissionVariant = 'correct' | 'wrong'

/**
 * True when the pin's bounding box fits entirely inside the rect.
 * Mirrors `isBoundsInsideTarget` from `useImagePinDropRuntime`, but in
 * normalized 0..1 coords so callers don't have to convert pin geometry
 * to natural pixels first.
 */
export function isPinInsideRect(
  pin: NormalizedPinBounds,
  rect: GameImagePinRect,
  imageNaturalWidth: number,
  imageNaturalHeight: number,
): boolean {
  if (imageNaturalWidth <= 0 || imageNaturalHeight <= 0) return false
  const rectLeft = rect.x / imageNaturalWidth
  const rectTop = rect.y / imageNaturalHeight
  const rectRight = (rect.x + rect.width) / imageNaturalWidth
  const rectBottom = (rect.y + rect.height) / imageNaturalHeight
  return (
    pin.left >= rectLeft && pin.top >= rectTop && pin.right <= rectRight && pin.bottom <= rectBottom
  )
}

export function evaluatePinSubmission(
  pin: NormalizedPinBounds,
  rect: GameImagePinRect,
  imageNaturalWidth: number,
  imageNaturalHeight: number,
): ImagePinSubmissionVariant {
  return isPinInsideRect(pin, rect, imageNaturalWidth, imageNaturalHeight) ? 'correct' : 'wrong'
}
