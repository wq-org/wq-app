import type { GameImagePinRect } from './game-image-pin.schema'

export const IMAGE_PIN_RECT_MIN_SIZE = 24

export function clampRectToImage(
  x: number,
  y: number,
  width: number,
  height: number,
  sceneWidth: number,
  sceneHeight: number,
): Pick<GameImagePinRect, 'x' | 'y' | 'width' | 'height'> {
  const w = Math.max(IMAGE_PIN_RECT_MIN_SIZE, Math.min(width, sceneWidth))
  const h = Math.max(IMAGE_PIN_RECT_MIN_SIZE, Math.min(height, sceneHeight))
  const nx = Math.max(0, Math.min(x, sceneWidth - w))
  const ny = Math.max(0, Math.min(y, sceneHeight - h))
  return { x: nx, y: ny, width: w, height: h }
}

export function createDefaultImagePinRectangle(
  sceneWidth: number,
  sceneHeight: number,
): GameImagePinRect {
  return {
    id: crypto.randomUUID(),
    question: '',
    ...clampRectToImage(
      sceneWidth * 0.2,
      sceneHeight * 0.2,
      sceneWidth * 0.25,
      sceneHeight * 0.2,
      sceneWidth,
      sceneHeight,
    ),
  }
}

/** Decode intrinsic pixel size of a bitmap `src` (e.g. data URL). */
export function loadImageNaturalSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/**
 * Remap rectangle geometry from an old natural image size to a new one (proportional sx/sy).
 * Preserves `id` and `question`. Clamps each box to the new bounds.
 * Alternative if overlays feel wrong when aspect ratio changes: uniform min-scale + centering.
 */
export function remapRectsForNewImageSize(
  rects: GameImagePinRect[],
  oldW: number,
  oldH: number,
  newW: number,
  newH: number,
): GameImagePinRect[] {
  if (oldW <= 0 || oldH <= 0 || newW <= 0 || newH <= 0) return rects
  const sx = newW / oldW
  const sy = newH / oldH
  return rects.map((r) => {
    const g = clampRectToImage(r.x * sx, r.y * sy, r.width * sx, r.height * sy, newW, newH)
    return { ...r, ...g, question: r.question }
  })
}
