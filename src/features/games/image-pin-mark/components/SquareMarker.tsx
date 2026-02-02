import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_SIZE = 80

export interface SquareMarkerProps {
  number: number
  x: number
  y: number
  width?: number
  height?: number
  onDelete?: () => void
  onPositionChange?: (x: number, y: number) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
  className?: string
  pointerEvents?: 'auto' | 'none'
}

export default function SquareMarker({
  number,
  x,
  y,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
  onDelete,
  onPositionChange,
  containerRef,
  className,
  pointerEvents = 'auto',
}: SquareMarkerProps) {
  const isDraggingRef = useRef(false)
  const didDragRef = useRef(false)
  const startRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pointerEvents === 'none' || !containerRef?.current || !onPositionChange) return
      e.stopPropagation()
      didDragRef.current = false
      isDraggingRef.current = true
      startRef.current = { x, y, clientX: e.clientX, clientY: e.clientY }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [pointerEvents, containerRef, onPositionChange, x, y],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (
        !isDraggingRef.current ||
        !startRef.current ||
        !containerRef?.current ||
        !onPositionChange
      )
        return
      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - startRef.current.clientX
      const deltaY = e.clientY - startRef.current.clientY
      didDragRef.current = didDragRef.current || Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2
      let newX = startRef.current.x + deltaX
      let newY = startRef.current.y + deltaY
      const halfW = width / 2
      const halfH = height / 2
      newX = Math.max(halfW, Math.min(rect.width - halfW, newX))
      newY = Math.max(halfH, Math.min(rect.height - halfH, newY))
      onPositionChange(newX, newY)
    },
    [containerRef, onPositionChange, width, height],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      isDraggingRef.current = false
      startRef.current = null
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (pointerEvents === 'auto') {
        e.stopPropagation()
        if (!didDragRef.current) onDelete?.()
      }
    },
    [pointerEvents, onDelete],
  )

  // Bounds are center (x, y) ± half width/height; same geometry as hit test in ImagePinMarkGame
  return (
    <div
      className={cn(
        'absolute flex items-center justify-center rounded-lg border-2 border-white bg-white/80 backdrop-blur-sm shadow-lg text-xl font-bold text-gray-900',
        pointerEvents === 'auto' && onPositionChange && 'cursor-grab active:cursor-grabbing',
        pointerEvents === 'none' && 'pointer-events-none',
        className,
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      {number}
    </div>
  )
}
