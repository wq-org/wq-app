import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { GameChatImageDescriptor } from './game-chat.types'

type GameChatImageProps = GameChatImageDescriptor & {
  className?: string
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

function GameChatImagePin({ src, alt, rect, className }: GameChatImagePinDescriptorWithClass) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    setDims(null)
  }, [src])

  if (!src) return null

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl shadow-sm', className)}>
      <img
        src={src}
        alt={alt ?? 'Game preview image'}
        crossOrigin="anonymous"
        draggable={false}
        className="block h-auto w-full"
        onLoad={(event) =>
          setDims({
            w: event.currentTarget.naturalWidth,
            h: event.currentTarget.naturalHeight,
          })
        }
      />
      {rect && dims ? (
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
    </div>
  )
}

type GameChatImagePinDescriptorWithClass = Extract<
  GameChatImageDescriptor,
  { variant: 'image-pin' }
> & {
  className?: string
}
