import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Konva from 'konva'
import { Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from 'react-konva'
import useImage from 'use-image'

import { Spinner } from '@/components/ui/spinner'
import type { GameImagePinRect } from '../image-pin.schema'
import { IMAGE_PIN_RECT_MIN_SIZE, clampRectToImage } from '../imagePinRectGeometry'
import { ImagePinRectErrorOverlay } from './ImagePinRectErrorOverlay'

const RECT_FILL = 'rgba(186, 213, 228, 0.18)'
const RECT_STROKE_SELECTED = '#0000FF'
const RECT_STROKE = '#4D4DFF'
const RECT_CORNER_RADIUS = 8
const RECT_DASH = [6, 6]
const LABEL_FONT_SIZE = 20
const LABEL_FONT_COLOR = '#0000FF'

type DraftBox = { sx: number; sy: number; cx: number; cy: number }

/** Calculate text position to center it inside a rectangle */
function getCenteredTextPosition(
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
  fontSize: number,
): { x: number; y: number } {
  const textWidth = fontSize * 0.6 // Approximate character width
  const x = rectX + (rectWidth - textWidth) / 2
  const y = rectY + (rectHeight - fontSize) / 2
  return { x, y }
}

export type ImagePinRectStageProps = {
  imageSrc: string
  rectangles: GameImagePinRect[]
  onRectanglesChange: (next: GameImagePinRect[]) => void
  selectedRectId: string | null
  onSelectedRectIdChange: (id: string | null) => void
  onSceneMetrics?: (metrics: { width: number; height: number }) => void
  onImageLoadFailed?: (imageSrc: string) => void
}

function getScenePointer(stage: Konva.Stage): { x: number; y: number } | null {
  const pos = stage.getPointerPosition()
  if (!pos) return null
  const scale = stage.scaleX()
  return { x: pos.x / scale, y: pos.y / scale }
}

function pointerToScene(stage: Konva.Stage, clientX: number, clientY: number) {
  const rect = stage.container().getBoundingClientRect()
  const scale = stage.scaleX()
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
  }
}

function normalizeDraft(d: DraftBox) {
  const x = Math.min(d.sx, d.cx)
  const y = Math.min(d.sy, d.cy)
  const width = Math.abs(d.cx - d.sx)
  const height = Math.abs(d.cy - d.sy)
  return { x, y, width, height }
}

export function ImagePinRectStage({
  imageSrc,
  rectangles,
  onRectanglesChange,
  selectedRectId,
  onSelectedRectIdChange,
  onSceneMetrics,
  onImageLoadFailed,
}: ImagePinRectStageProps) {
  const [image, status] = useImage(imageSrc, 'anonymous')
  const [draft, setDraft] = useState<DraftBox | null>(null)
  const [imageFailureReported, setImageFailureReported] = useState(false)

  const hasImage = image && status === 'loaded'
  const isImageLoading = Boolean(imageSrc) && status === 'loading'
  const isImageFailed = status === 'failed'

  useEffect(() => {
    if (status === 'loaded') {
      setImageFailureReported(false)
    }
  }, [status])

  useEffect(() => {
    if (isImageFailed && !imageFailureReported && onImageLoadFailed) {
      setImageFailureReported(true)
      const src = imageSrc
      queueMicrotask(() => onImageLoadFailed(src))
    }
  }, [isImageFailed, imageFailureReported, onImageLoadFailed, imageSrc])

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const rectRefs = useRef<Record<string, Konva.Rect | null>>({})
  const rectanglesRef = useRef(rectangles)

  useEffect(() => {
    rectanglesRef.current = rectangles
  }, [rectangles])

  useEffect(() => {
    setDraft(null)
  }, [imageSrc])

  const sceneSize = useMemo(
    () => ({
      width: image?.naturalWidth ?? 1000,
      height: image?.naturalHeight ?? 700,
    }),
    [image],
  )

  useEffect(() => {
    if (!onSceneMetrics) return
    if (!image?.naturalWidth || !image?.naturalHeight) return
    const metrics = { width: image.naturalWidth, height: image.naturalHeight }
    queueMicrotask(() => onSceneMetrics(metrics))
  }, [image, onSceneMetrics])

  const [stageScale, setStageScale] = useState(1)

  const updateScale = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    if (sceneSize.width <= 0) return
    const scale = Math.min(containerWidth / sceneSize.width, 1)
    setStageScale(scale > 0 ? scale : 1)
  }, [sceneSize.width])

  useEffect(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  useEffect(() => {
    if (!selectedRectId || !transformerRef.current) return
    const selectedNode = rectRefs.current[selectedRectId]
    if (!selectedNode) return
    transformerRef.current.nodes([selectedNode])
    transformerRef.current.getLayer()?.batchDraw()
  }, [selectedRectId, rectangles])

  const notifyRectanglesChange = useCallback(
    (next: GameImagePinRect[]) => {
      queueMicrotask(() => onRectanglesChange(next))
    },
    [onRectanglesChange],
  )

  const notifySelectedRectIdChange = useCallback(
    (id: string | null) => {
      queueMicrotask(() => onSelectedRectIdChange(id))
    },
    [onSelectedRectIdChange],
  )

  const patchRect = useCallback(
    (id: string, patch: Partial<GameImagePinRect>) => {
      notifyRectanglesChange(
        rectangles.map((rect) => {
          if (rect.id !== id) return rect
          const merged = { ...rect, ...patch }
          const c = clampRectToImage(
            merged.x,
            merged.y,
            merged.width,
            merged.height,
            sceneSize.width,
            sceneSize.height,
          )
          return { ...merged, ...c }
        }),
      )
    },
    [notifyRectanglesChange, rectangles, sceneSize.height, sceneSize.width],
  )

  const draftShape = useMemo(() => (draft ? normalizeDraft(draft) : null), [draft])

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const target = e.target
      if (target.getClassName() !== 'Image') return

      const stage = e.target.getStage()
      if (!stage || !image) return

      const pos = getScenePointer(stage)
      if (!pos) return
      if (pos.x < 0 || pos.x > sceneSize.width || pos.y < 0 || pos.y > sceneSize.height) return

      const sx = Math.max(0, Math.min(pos.x, sceneSize.width))
      const sy = Math.max(0, Math.min(pos.y, sceneSize.height))
      notifySelectedRectIdChange(null)

      const onMove = (ev: MouseEvent) => {
        const st = stageRef.current
        if (!st) return
        const p = pointerToScene(st, ev.clientX, ev.clientY)
        const cx = Math.max(0, Math.min(p.x, sceneSize.width))
        const cy = Math.max(0, Math.min(p.y, sceneSize.height))
        setDraft({ sx, sy, cx, cy })
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        setDraft((current) => {
          if (!current) return null
          const norm = normalizeDraft(current)
          if (norm.width < 8 || norm.height < 8) return null
          const clamped = clampRectToImage(
            norm.x,
            norm.y,
            norm.width,
            norm.height,
            sceneSize.width,
            sceneSize.height,
          )
          const id = crypto.randomUUID()
          const newRect: GameImagePinRect = { id, ...clamped, question: '' }
          queueMicrotask(() => {
            notifyRectanglesChange([...rectanglesRef.current, newRect])
            notifySelectedRectIdChange(id)
          })
          return null
        })
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      setDraft({ sx, sy, cx: sx, cy: sy })
    },
    [image, notifyRectanglesChange, notifySelectedRectIdChange, sceneSize.height, sceneSize.width],
  )

  if (isImageLoading) {
    return (
      <div
        ref={containerRef}
        className="flex min-h-48 w-full items-center justify-center rounded-lg border bg-muted/20"
      >
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border bg-muted/20"
    >
      <Stage
        ref={stageRef}
        width={sceneSize.width * stageScale}
        height={sceneSize.height * stageScale}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          {hasImage ? (
            <KonvaImage
              image={image}
              x={0}
              y={0}
              width={sceneSize.width}
              height={sceneSize.height}
            />
          ) : null}

          {rectangles.map((rect, index) => {
            const questionNum = index + 1
            const labelPos = getCenteredTextPosition(
              rect.x,
              rect.y,
              rect.width,
              rect.height,
              LABEL_FONT_SIZE,
            )

            return (
              <React.Fragment key={rect.id}>
                <Rect
                  ref={(node) => {
                    rectRefs.current[rect.id] = node
                  }}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  cornerRadius={RECT_CORNER_RADIUS}
                  fill={RECT_FILL}
                  stroke={selectedRectId === rect.id ? RECT_STROKE_SELECTED : RECT_STROKE}
                  strokeWidth={2}
                  dash={RECT_DASH}
                  draggable
                  onClick={() => notifySelectedRectIdChange(rect.id)}
                  onTap={() => notifySelectedRectIdChange(rect.id)}
                  onDragEnd={(event) => {
                    const node = event.target
                    const c = clampRectToImage(
                      node.x(),
                      node.y(),
                      node.width(),
                      node.height(),
                      sceneSize.width,
                      sceneSize.height,
                    )
                    patchRect(rect.id, { x: c.x, y: c.y })
                  }}
                  onTransformEnd={() => {
                    const node = rectRefs.current[rect.id]
                    if (!node) return
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()
                    node.scaleX(1)
                    node.scaleY(1)
                    const rawW = Math.max(IMAGE_PIN_RECT_MIN_SIZE, node.width() * scaleX)
                    const rawH = Math.max(IMAGE_PIN_RECT_MIN_SIZE, node.height() * scaleY)
                    const c = clampRectToImage(
                      node.x(),
                      node.y(),
                      rawW,
                      rawH,
                      sceneSize.width,
                      sceneSize.height,
                    )
                    patchRect(rect.id, { x: c.x, y: c.y, width: c.width, height: c.height })
                  }}
                />

                {/* Question number label centered in rectangle */}
                <Text
                  x={labelPos.x}
                  y={labelPos.y}
                  text={`Q${questionNum}`}
                  fontSize={LABEL_FONT_SIZE}
                  fontFamily="Arial, sans-serif"
                  fontStyle="bold"
                  fill={LABEL_FONT_COLOR}
                  align="center"
                  pointerEvents="none"
                />
              </React.Fragment>
            )
          })}

          {draftShape ? (
            <Rect
              x={draftShape.x}
              y={draftShape.y}
              width={Math.max(IMAGE_PIN_RECT_MIN_SIZE, draftShape.width)}
              height={Math.max(IMAGE_PIN_RECT_MIN_SIZE, draftShape.height)}
              cornerRadius={RECT_CORNER_RADIUS}
              fill="rgba(0, 0, 255, 0.08)"
              stroke={RECT_STROKE_SELECTED}
              strokeWidth={1}
              dash={RECT_DASH}
              listening={false}
            />
          ) : null}

          {selectedRectId ? (
            <Transformer
              ref={transformerRef}
              flipEnabled={false}
              rotateEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (
                  Math.abs(newBox.width) < IMAGE_PIN_RECT_MIN_SIZE ||
                  Math.abs(newBox.height) < IMAGE_PIN_RECT_MIN_SIZE
                ) {
                  return oldBox
                }
                return newBox
              }}
            />
          ) : null}
        </Layer>
      </Stage>

      {isImageFailed && <ImagePinRectErrorOverlay />}
    </div>
  )
}
