'use client'

/**
 * ImageCardStack.tsx
 * ─────────────────────────────────────────────────────────────
 * Swipeable card stack that toggles to a scrollable grid view.
 *
 * Named exports:
 *   <ImageCardStack images={[]} />   — main component
 *   <CardStackView />                — stack-only view
 *   <CardGridView />                 — grid-only view
 *
 * Props:
 *   images        — array of { src, alt? }
 *   onDownloadAll — callback when download button pressed
 *
 * Deps:
 *   motion (framer-motion / motion for react)
 *   shadcn: Button, AspectRatio, Badge
 *   lucide-react: LayoutGrid, Layers, Download
 *   Tailwind CSS for all animation & layout
 */

import * as React from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'motion/react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, Layers, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageItem {
  src: string
  alt?: string
}

export interface ImageCardStackProps {
  images: ImageItem[]
  onDownloadAll?: () => void
  className?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 80 // px drag distance to trigger swipe
const SWIPE_VELOCITY = 500 // px/s velocity to trigger swipe
const CARD_OFFSET = 10 // px stagger offset per card behind top
const CARD_SCALE_STEP = 0.04 // scale reduction per card behind top

// ─── Single draggable card ────────────────────────────────────────────────────

interface DragCardProps {
  image: ImageItem
  index: number // 0 = top
  total: number
  onSwipedAway: () => void
}

function DragCard({ image, index, total, onSwipedAway }: DragCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0])

  const isTop = index === 0
  const zIndex = total - index

  // Stacked visual offset for cards behind top
  const translateY = index * CARD_OFFSET
  const scale = 1 - index * CARD_SCALE_STEP

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const shouldSwipe =
      Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > SWIPE_VELOCITY

    if (shouldSwipe) {
      const direction = info.offset.x > 0 ? 1 : -1
      animate(x, direction * 600, {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        onComplete: onSwipedAway,
      })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        translateY,
        scale,
      }}
      animate={{ translateY, scale }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileDrag={isTop ? { cursor: 'grabbing' } : undefined}
    >
      <div
        className={cn(
          'h-full w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-xl',
          isTop ? 'cursor-grab' : 'cursor-default',
        )}
      >
        <AspectRatio
          ratio={3 / 4}
          className="h-full w-full"
        >
          <img
            src={image.src}
            alt={image.alt ?? 'Image'}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </AspectRatio>
      </div>
    </motion.div>
  )
}

// ─── CardStackView ────────────────────────────────────────────────────────────

export interface CardStackViewProps {
  images: ImageItem[]
  className?: string
}

export function CardStackView({ images, className }: CardStackViewProps) {
  // Keep a circular queue: rotate array so top card cycles to back on swipe
  const [cards, setCards] = React.useState<ImageItem[]>(images)

  React.useEffect(() => {
    setCards(images)
  }, [images])

  const handleSwipedAway = () => {
    setCards((prev) => {
      const [first, ...rest] = prev
      return [...rest, first]
    })
  }

  // Only render top N visible cards for performance
  const visible = cards.slice(0, Math.min(4, cards.length))

  return (
    <div className={cn('relative mx-auto w-full max-w-[260px]', className)}>
      {/* Aspect ratio shell to set height */}
      <AspectRatio ratio={3 / 4}>
        {visible.map((img, i) => (
          <DragCard
            key={`${img.src}-${i}`}
            image={img}
            index={i}
            total={visible.length}
            onSwipedAway={i === 0 ? handleSwipedAway : () => {}}
          />
        ))}
      </AspectRatio>
    </div>
  )
}

// ─── CardGridView ─────────────────────────────────────────────────────────────

export interface CardGridViewProps {
  images: ImageItem[]
  className?: string
}

export function CardGridView({ images, className }: CardGridViewProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 overflow-y-auto',
        'max-h-[420px] pr-1',
        // scrollbar styling
        '[&::-webkit-scrollbar]:w-1',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:bg-neutral-700',
        className,
      )}
    >
      {images.map((img, i) => (
        <motion.div
          key={img.src}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18, delay: i * 0.04 }}
          className="overflow-hidden rounded-xl bg-neutral-900"
        >
          <AspectRatio ratio={1}>
            <img
              src={img.src}
              alt={img.alt ?? `Image ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </AspectRatio>
        </motion.div>
      ))}
    </div>
  )
}

// ─── ImageCardStack (composed root) ──────────────────────────────────────────

export function ImageCardStack({ images, onDownloadAll, className }: ImageCardStackProps) {
  const [view, setView] = React.useState<'stack' | 'grid'>('stack')

  if (!images.length) return null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header row: item count + view toggle */}
      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 bg-transparent px-0 text-sm font-medium text-blue-400 hover:bg-transparent"
        >
          <LayoutGrid className="h-4 w-4" />
          {images.length} {images.length === 1 ? 'Item' : 'Items'}
        </Badge>

        <div className="flex items-center gap-1">
          {/* Toggle stack / grid */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={view === 'stack' ? 'Switch to grid view' : 'Switch to stack view'}
            onClick={() => setView((v) => (v === 'stack' ? 'grid' : 'stack'))}
            className="h-8 w-8 text-neutral-400 hover:text-white"
          >
            {view === 'stack' ? <LayoutGrid className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          </Button>

          {/* Download all */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Download all"
            onClick={onDownloadAll}
            className="h-8 w-8 rounded-full bg-neutral-800 text-blue-400 hover:bg-neutral-700 hover:text-blue-300"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View panel */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {view === 'stack' ? <CardStackView images={images} /> : <CardGridView images={images} />}
      </motion.div>

      {/* Stack hint */}
      {view === 'stack' && images.length > 1 && (
        <p className="text-center text-xs text-neutral-600">Swipe left or right to cycle</p>
      )}
    </div>
  )
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

const DEMO_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
    alt: 'Portrait 1',
  },
  {
    src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    alt: 'Portrait 2',
  },
  {
    src: 'https://images.unsplash.com/photo-1542740348-39501cd6e2b4?w=600&q=80',
    alt: 'Portrait 3',
  },
  {
    src: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=600&q=80',
    alt: 'Portrait 4',
  },
]

export default function ImageCardStackDemo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-xs">
        <ImageCardStack
          images={DEMO_IMAGES}
          onDownloadAll={() => console.log('download all')}
        />
      </div>
    </div>
  )
}
