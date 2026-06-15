'use client'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  DND_MATH_CANVAS_COLLAPSED_HEIGHT_CLASS,
  DND_MATH_CANVAS_COLLAPSED_MIN_HEIGHT_CLASS,
  DND_MATH_CANVAS_EXPANDED_HEIGHT_CLASS,
} from '../constants/canvas-dnd.constants'
import { DnDMathCanvas, type DnDMathCanvasProps } from './canvas/DnDMathCanvas'
import { MathNodePalette } from './MathNodePalette'

export type DnDMathCanvasPanelProps = DnDMathCanvasProps & {
  className?: string
  showPaletteLabel?: boolean
}

const canvasPanelToggleAnimation =
  'animate-in fade-in-0 slide-in-from-bottom-4 duration-200 ease-in-out' as const

export function DnDMathCanvasPanel({
  className,
  showPaletteLabel = true,
  ...canvasProps
}: DnDMathCanvasPanelProps) {
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
            DND_MATH_CANVAS_COLLAPSED_MIN_HEIGHT_CLASS,
            'transition-[height] duration-200 ease-in-out',
            isExpanded
              ? DND_MATH_CANVAS_EXPANDED_HEIGHT_CLASS
              : DND_MATH_CANVAS_COLLAPSED_HEIGHT_CLASS,
          )}
          viewportClassName="pb-1"
        >
          <div
            key={isExpanded ? 'expanded' : 'collapsed'}
            className={canvasPanelToggleAnimation}
          >
            <DnDMathCanvas
              {...canvasProps}
              embedded
            />
          </div>
        </BlurredScrollArea>
      </div>

      <div className="shrink-0 border-t border-border/60 px-3 py-2">
        <BlurredScrollArea
          orientation="horizontal"
          hideHorizontalScrollBar
          className="min-w-0"
          viewportClassName="pb-1"
        >
          <div className="w-max">
            <MathNodePalette
              showLabel={showPaletteLabel}
              disabled={canvasProps.interactionLocked}
            />
          </div>
        </BlurredScrollArea>
      </div>
    </div>
  )
}
