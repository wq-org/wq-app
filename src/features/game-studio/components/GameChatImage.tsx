'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { GameChatImageDescriptor } from './game-chat.types'

type GameChatImageProps = GameChatImageDescriptor & {
  className?: string
  children?: ReactNode
}

const RECT_FILL = 'rgba(0, 0, 255, 0.12)'
const RECT_STROKE = '#0000FF'
const RECT_CORNER_RADIUS = 8
const RECT_DASH_PATTERN = '6 6'

export function GameChatImage(props: GameChatImageProps) {
  switch (props.variant) {
    case 'image-pin':
      return <GameChatImagePin {...props} />
  }
}

type ImagePinViewProps = Extract<GameChatImageDescriptor, { variant: 'image-pin' }> & {
  className?: string
  children?: ReactNode
}

function GameChatImagePin(props: ImagePinViewProps) {
  if (props.droppableId) {
    return (
      <GameChatImagePinDroppable
        {...props}
        droppableId={props.droppableId}
      />
    )
  }
  return <GameChatImagePinStatic {...props} />
}

function GameChatImagePinStatic({
  src,
  alt,
  rect,
  showTargetRect = false,
  className,
  children,
}: ImagePinViewProps) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    setDims(null)
  }, [src])

  if (!src) return null

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl shadow-sm', className)}>
      <GameChatImagePinMedia
        src={src}
        alt={alt}
        rect={rect}
        showTargetRect={showTargetRect}
        dims={dims}
        onDims={setDims}
      />
      {children}
    </div>
  )
}

type DroppableProps = ImagePinViewProps & { droppableId: string }

function GameChatImagePinDroppable({
  src,
  alt,
  rect,
  showTargetRect = false,
  className,
  children,
  droppableId,
}: DroppableProps) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })

  useEffect(() => {
    setDims(null)
  }, [src])

  if (!src) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl shadow-sm transition-shadow',
        isOver && 'ring-2 ring-[#0000FF] ring-offset-2 ring-offset-background',
        className,
      )}
    >
      <GameChatImagePinMedia
        src={src}
        alt={alt}
        rect={rect}
        showTargetRect={showTargetRect}
        dims={dims}
        onDims={setDims}
      />
      {children}
    </div>
  )
}

type MediaProps = {
  src: string
  alt?: string
  rect: ImagePinViewProps['rect']
  showTargetRect?: boolean
  dims: { w: number; h: number } | null
  onDims: (dims: { w: number; h: number }) => void
}

function GameChatImagePinMedia({
  src,
  alt,
  rect,
  showTargetRect = false,
  dims,
  onDims,
}: MediaProps) {
  return (
    <>
      <img
        src={src}
        alt={alt ?? 'Game preview image'}
        crossOrigin="anonymous"
        draggable={false}
        className="block h-auto w-full"
        onLoad={(event) =>
          onDims({
            w: event.currentTarget.naturalWidth,
            h: event.currentTarget.naturalHeight,
          })
        }
      />
      {rect && dims && showTargetRect ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          preserveAspectRatio="none"
        >
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            rx={RECT_CORNER_RADIUS}
            ry={RECT_CORNER_RADIUS}
            fill={RECT_FILL}
            stroke={RECT_STROKE}
            strokeWidth={2}
            strokeDasharray={RECT_DASH_PATTERN}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </>
  )
}
