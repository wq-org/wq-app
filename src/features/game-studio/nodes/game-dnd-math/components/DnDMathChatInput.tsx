'use client'

import { Score } from '@/components/ui/score'
import { cn } from '@/lib/utils'

import { DnDMathCanvasPanel, type DnDMathCanvasPanelProps } from './DnDMathCanvasPanel'

export type DnDMathChatInputProps = DnDMathCanvasPanelProps & {
  score?: number
  maxScore?: number
  /** Passed to {@link DnDMathCanvasPanel} (e.g. transparent preview shell). */
  panelClassName?: string
}

export function DnDMathChatInput({
  className,
  score = 0,
  maxScore = 0,
  panelClassName,
  ...canvasProps
}: DnDMathChatInputProps) {
  return (
    <div className={cn('flex w-full items-end gap-3', className)}>
      <Score
        score={score}
        max={maxScore}
        size="lg"
        variant="orange"
      />
      <DnDMathCanvasPanel
        {...canvasProps}
        className={panelClassName}
      />
    </div>
  )
}
