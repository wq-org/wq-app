'use client'

import { Score } from '@/components/ui/score'
import { cn } from '@/lib/utils'

import { ImagePinSourceSlot } from './ImagePinSourceSlot'

export type ImagePinChatInputProps = {
  score: number
  maxScore: number
  pinAtSource: boolean
  className?: string
}

/** Preview footer: score ring + pin source drop zone (drag-and-drop, no text composer). */
export function ImagePinChatInput({
  score,
  maxScore,
  pinAtSource,
  className,
}: ImagePinChatInputProps) {
  return (
    <div className={cn('flex w-full shrink-0 items-center gap-3', className)}>
      <Score
        score={score}
        max={maxScore}
        size="lg"
        variant="orange"
      />
      <ImagePinSourceSlot
        pinAtSource={pinAtSource}
        className="min-w-0 flex-1"
      />
    </div>
  )
}
