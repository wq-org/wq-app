'use client'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { DragDropMathCanvas, type DragDropMathCanvasProps } from './canvas/DragDropMathCanvas'
import { MathNodePalette } from './MathNodePalette'

export type DragDropMathCanvasPanelProps = DragDropMathCanvasProps & {
  className?: string
  showPaletteLabel?: boolean
}

const canvasPanelToggleAnimation =
  'animate-in fade-in-0 slide-in-from-bottom-4 duration-200 ease-in-out' as const

export function DragDropMathCanvasPanel({
  className,
  showPaletteLabel = true,
  ...canvasProps
}: DragDropMathCanvasPanelProps) {
  const { t } = useTranslation('features.gameStudio')
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-dashed border-border/70 bg-secondary/30',
        className,
      )}
    >
      <div className="relative shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          aria-label={
            isExpanded
              ? t('dragDropMathGamePreview.collapseCanvasAriaLabel')
              : t('dragDropMathGamePreview.expandCanvasAriaLabel')
          }
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <span
            key={isExpanded ? 'collapse' : 'expand'}
            className={cn('inline-flex', canvasPanelToggleAnimation)}
          >
            {isExpanded ? (
              <ArrowDownLeft className="size-4" />
            ) : (
              <ArrowUpRight className="size-4" />
            )}
          </span>
        </Button>

        <BlurredScrollArea
          orientation="vertical"
          hideScrollBar
          className={cn(
            'min-h-[200px] transition-[height] duration-200 ease-in-out',
            isExpanded ? 'h-[60vh]' : 'h-[240px]',
          )}
          viewportClassName="pb-1"
        >
          <div
            key={isExpanded ? 'expanded' : 'collapsed'}
            className={canvasPanelToggleAnimation}
          >
            <DragDropMathCanvas
              {...canvasProps}
              embedded
            />
          </div>
        </BlurredScrollArea>
      </div>

      <div className="shrink-0 border-t border-border/60 px-3 py-3">
        <BlurredScrollArea
          orientation="horizontal"
          hideHorizontalScrollBar
          className="min-w-0"
          viewportClassName="pb-1"
        >
          <div className="w-max">
            <MathNodePalette showLabel={showPaletteLabel} />
          </div>
        </BlurredScrollArea>
      </div>
    </div>
  )
}
