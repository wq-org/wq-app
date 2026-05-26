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
}

export function DragDropMathCanvasPanel({
  className,
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
          {isExpanded ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
        </Button>

        <BlurredScrollArea
          key={isExpanded ? 'expanded' : 'collapsed'}
          orientation="vertical"
          hideScrollBar
          className={cn(
            'min-h-[200px] transition-[height] duration-200 ease-out',
            isExpanded ? 'h-[60vh]' : 'h-[240px]',
          )}
          viewportClassName="pb-1"
        >
          <DragDropMathCanvas
            {...canvasProps}
            embedded
          />
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
            <MathNodePalette />
          </div>
        </BlurredScrollArea>
      </div>
    </div>
  )
}
