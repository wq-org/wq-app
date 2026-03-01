import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { GripVertical } from 'lucide-react'

interface Feature7Props {
  badgeText?: string
  title?: string
  description?: string
  beforeImageSrc?: string
  afterImageSrc?: string
  beforeImageAlt?: string
  afterImageAlt?: string
  initialSplit?: number
}

export function Feature7({
  badgeText = 'Platform',
  title = 'Something new!',
  description = 'Managing a small business today is already tough.',
  beforeImageSrc = '/feature8.png',
  afterImageSrc = '/darkmode-feature8.png',
  beforeImageAlt = 'Before preview',
  afterImageAlt = 'After preview',
  initialSplit = 50,
}: Feature7Props) {
  const [inset, setInset] = useState<number>(initialSplit)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    let x = 0

    if ('touches' in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left
    } else if ('clientX' in e) {
      x = e.clientX - rect.left
    }

    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100))
    setInset(percentage)
  }

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <Badge>{badgeText}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-regular tracking-tighter md:text-5xl lg:max-w-xl">
              {title}
            </h2>
            <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-xl">
              {description}
            </p>
          </div>
          <div className="w-full pt-12">
            <div
              className="relative aspect-video h-full w-full select-none overflow-hidden rounded-2xl"
              onMouseMove={onPointerMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={onPointerMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              <div
                className="absolute top-0 z-20 h-full w-1 bg-muted"
                style={{ left: `${inset}%` }}
              >
                <button
                  className="absolute top-1/2 z-30 flex h-10 w-5 -translate-y-1/2 -ml-2 cursor-ew-resize items-center justify-center rounded bg-muted transition-all hover:scale-110"
                  onTouchStart={(e) => {
                    setIsDragging(true)
                    onPointerMove(e)
                  }}
                  onMouseDown={(e) => {
                    setIsDragging(true)
                    onPointerMove(e)
                  }}
                  onTouchEnd={() => setIsDragging(false)}
                  onMouseUp={() => setIsDragging(false)}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </div>
              <img
                src={beforeImageSrc}
                alt={beforeImageAlt}
                className="absolute left-0 top-0 z-10 h-full w-full rounded-2xl border object-cover"
                style={{ clipPath: `inset(0 0 0 ${inset}%)` }}
              />
              <img
                src={afterImageSrc}
                alt={afterImageAlt}
                className="absolute left-0 top-0 h-full w-full rounded-2xl border object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Feature9 = Feature7
