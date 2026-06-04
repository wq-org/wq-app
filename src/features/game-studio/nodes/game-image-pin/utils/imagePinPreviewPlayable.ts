import type { GameImagePinNodeData } from '../image-pin.schema'

export function isImagePinPreviewPlayable(nodeData: GameImagePinNodeData): boolean {
  const hasImage =
    (typeof nodeData.imagePreview === 'string' && nodeData.imagePreview.trim() !== '') ||
    (typeof nodeData.filepath === 'string' && nodeData.filepath.trim() !== '')
  if (!hasImage) return false

  const rectangles = Array.isArray(nodeData.rectangles) ? nodeData.rectangles : []
  return rectangles.some((rect) => String(rect.question ?? '').trim() !== '')
}
