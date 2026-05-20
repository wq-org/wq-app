import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
} from 'lexical'
import { Palette } from 'lucide-react'
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type PaletteColor = {
  label: string
  variable: `--oklch-${string}`
}

const PALETTE_COLORS: readonly PaletteColor[] = [
  { label: 'Black', variable: '--oklch-black' },
  { label: 'Violet', variable: '--oklch-violet' },
  { label: 'Indigo', variable: '--oklch-indigo' },
  { label: 'Blue', variable: '--oklch-blue' },
  { label: 'Cyan', variable: '--oklch-cyan' },
  { label: 'Teal', variable: '--oklch-teal' },
  { label: 'Green', variable: '--oklch-green' },
  { label: 'Lime', variable: '--oklch-lime' },
  { label: 'Orange', variable: '--oklch-orange' },
  { label: 'Pink', variable: '--oklch-pink' },
  { label: 'Dark Blue', variable: '--oklch-darkblue' },
  { label: 'Magenta', variable: '--oklch-magenta' },
  { label: 'Red', variable: '--oklch-red' },
  { label: 'Deep Cyan', variable: '--oklch-deep-cyan' },
  { label: 'Yellow', variable: '--oklch-yellow' },
]

function getBackgroundColorValue(variable: PaletteColor['variable']): string {
  return `oklch(var(${variable}))`
}

type TextHighlightToolbarButtonProps = {
  editor: LexicalEditor
  className: string
  enabled: boolean
}

export function TextHighlightToolbarButton({
  editor,
  className,
  enabled,
}: TextHighlightToolbarButtonProps) {
  const [open, setOpen] = useState(false)
  const [activeColor, setActiveColor] = useState('')

  const readSelectionColor = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || selection.isCollapsed()) {
        return ''
      }
      return $getSelectionStyleValueForProperty(selection, 'background-color', '')
    })
  }, [editor])

  useEffect(() => {
    setActiveColor(readSelectionColor())
    return editor.registerUpdateListener(() => {
      setActiveColor(readSelectionColor())
    })
  }, [editor, readSelectionColor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        setActiveColor(readSelectionColor())
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, readSelectionColor])

  useEffect(() => {
    if (!enabled) {
      setOpen(false)
    }
  }, [enabled])

  const handleApply = (variable: PaletteColor['variable']) => {
    const colorValue = getBackgroundColorValue(variable)
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || selection.isCollapsed()) return

      const currentColor = $getSelectionStyleValueForProperty(selection, 'background-color', '')
      const nextColor = currentColor === colorValue ? '' : colorValue
      $patchStyleText(selection, { 'background-color': nextColor })
    })
    setOpen(false)
    editor.focus()
  }

  const handleSwatchKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const grid = event.currentTarget.parentElement
    if (!grid) return
    const swatches = Array.from(
      grid.querySelectorAll<HTMLButtonElement>('button[data-highlight-swatch="true"]'),
    )
    if (swatches.length === 0) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const nextIndex = (index + 1) % swatches.length
      swatches[nextIndex]?.focus()
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      const prevIndex = (index - 1 + swatches.length) % swatches.length
      swatches[prevIndex]?.focus()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      handleApply(PALETTE_COLORS[index].variable)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => setOpen(enabled ? nextOpen : false)}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Highlight text"
          aria-label="Highlight text"
          aria-disabled={!enabled}
          disabled={!enabled}
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            className,
            !enabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
          )}
        >
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-[15rem] rounded-xl border border-border bg-popover/95 p-3 shadow-lg backdrop-blur supports-backdrop-filter:bg-popover/90"
      >
        <div className="grid grid-cols-5 gap-2">
          {PALETTE_COLORS.map((color, index) => {
            const colorValue = getBackgroundColorValue(color.variable)
            const isActive = activeColor === colorValue
            return (
              <button
                key={color.variable}
                type="button"
                title={color.label}
                aria-label={`Highlight ${color.label}`}
                data-highlight-swatch="true"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleApply(color.variable)}
                onKeyDown={(event) => handleSwatchKeyDown(event, index)}
                className="w-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <AspectRatio ratio={1}>
                  <div
                    className={cn(
                      'h-full w-full rounded-md transition-transform hover:scale-110',
                      isActive && 'ring-2 ring-white ring-offset-2',
                      'ring-offset-background',
                    )}
                    style={{ backgroundColor: colorValue }}
                  />
                </AspectRatio>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
