import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Rect = { x: number; y: number; width: number; height: number }

export type CropTarget = {
  /** Stable key (used as React key). */
  fieldKey: string
  /** Visible button label, e.g. "Insert into Description". */
  label: string
}

type PdfImageCropOverlayProps = {
  /** Ref to the element containing the PDF canvas. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Available insert targets — one button rendered per entry. */
  targets: CropTarget[]
  /** Called with the cropped blob and the selected target's fieldKey. */
  onCropConfirm: (fieldKey: string, blob: Blob) => void
  onCancel: () => void
  /** Visible label of the cancel button. */
  cancelLabel: string
}

function normalizeRect(raw: Rect): Rect {
  return {
    x: raw.width < 0 ? raw.x + raw.width : raw.x,
    y: raw.height < 0 ? raw.y + raw.height : raw.y,
    width: Math.abs(raw.width),
    height: Math.abs(raw.height),
  }
}

export function PdfImageCropOverlay({
  containerRef,
  targets,
  onCropConfirm,
  onCancel,
  cancelLabel,
}: PdfImageCropOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<Rect | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const getRelativePoint = useCallback((e: MouseEvent): { x: number; y: number } | null => {
    const el = overlayRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const pt = getRelativePoint(e)
      if (!pt) return
      dragStartRef.current = pt
      setSelection({ x: pt.x, y: pt.y, width: 0, height: 0 })
      setIsDragging(true)
    },
    [getRelativePoint],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return
      const pt = getRelativePoint(e)
      if (!pt) return
      setSelection({
        x: dragStartRef.current.x,
        y: dragStartRef.current.y,
        width: pt.x - dragStartRef.current.x,
        height: pt.y - dragStartRef.current.y,
      })
    },
    [isDragging, getRelativePoint],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    el.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      el.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const cropToBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!selection || !containerRef.current) return resolve(null)
      const norm = normalizeRect(selection)
      if (norm.width < 4 || norm.height < 4) return resolve(null)

      const canvas = containerRef.current.querySelector<HTMLCanvasElement>('canvas')
      if (!canvas) return resolve(null)

      const overlayEl = overlayRef.current
      if (!overlayEl) return resolve(null)

      const overlayRect = overlayEl.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()

      const offsetX = canvasRect.left - overlayRect.left
      const offsetY = canvasRect.top - overlayRect.top
      const scaleX = canvas.width / canvasRect.width
      const scaleY = canvas.height / canvasRect.height

      const cropX = Math.max(0, (norm.x - offsetX) * scaleX)
      const cropY = Math.max(0, (norm.y - offsetY) * scaleY)
      const cropW = Math.min(canvas.width - cropX, norm.width * scaleX)
      const cropH = Math.min(canvas.height - cropY, norm.height * scaleY)

      if (cropW <= 0 || cropH <= 0) return resolve(null)

      const offscreen = document.createElement('canvas')
      offscreen.width = cropW
      offscreen.height = cropH
      offscreen.getContext('2d')!.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
      offscreen.toBlob((blob) => resolve(blob), 'image/webp')
    })
  }, [selection, containerRef])

  const handleConfirm = useCallback(
    async (fieldKey: string) => {
      const blob = await cropToBlob()
      if (blob) onCropConfirm(fieldKey, blob)
    },
    [cropToBlob, onCropConfirm],
  )

  const norm = selection ? normalizeRect(selection) : null
  const hasSelection = norm && norm.width > 2 && norm.height > 2
  const showActions = hasSelection && !isDragging

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10 cursor-crosshair"
      style={{ userSelect: 'none' }}
    >
      {hasSelection ? (
        <div
          className="pointer-events-none absolute rounded border-2 border-dashed border-blue-500 bg-blue-500/10"
          style={{
            left: norm!.x,
            top: norm!.y,
            width: norm!.width,
            height: norm!.height,
          }}
        />
      ) : null}

      {showActions ? (
        <div
          className="absolute flex min-w-[180px] flex-col gap-1 rounded-lg bg-popover/80 p-1.5 shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl"
          style={{
            left: norm!.x + norm!.width,
            top: norm!.y + norm!.height + 8,
            transform: 'translateX(-100%)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {targets.map((target) => (
            <Button
              key={target.fieldKey}
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 w-full justify-start gap-1.5 px-2.5 text-xs"
              onClick={() => handleConfirm(target.fieldKey)}
            >
              <Check className="size-3.5 shrink-0" />
              {target.label}
            </Button>
          ))}

          <Button
            type="button"
            size="sm"
            variant="delete"
            className="h-8 w-full justify-start gap-1.5 px-2.5 text-xs"
            onClick={onCancel}
          >
            <X className="size-3.5 shrink-0" />
            {cancelLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
