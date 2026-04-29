import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import {
  formatProgrammeDurationYearLabel,
  isProgrammeDurationYearOptionSelected,
} from '../utils/programmeDurationYears'

type YearSelectPopoverProps = {
  label: string
  value: number | null
  /** Shown in the trigger when `value` is null (optional; defaults to em dash). */
  placeholder?: string
  years: readonly number[]
  onChange: (year: number) => void
  className?: string
  disabled?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function YearSelectPopover({
  label,
  value,
  placeholder,
  years,
  onChange,
  className,
  side,
  disabled = false,
}: YearSelectPopoverProps) {
  const [open, setOpen] = useState(false)
  const displayLabel =
    value === null ? (placeholder ?? '—') : formatProgrammeDurationYearLabel(value)

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 min-h-10 justify-between font-normal',
            value === null && 'text-muted-foreground',
            className,
          )}
          aria-label={label}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="w-auto p-0"
        align="start"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onWheel={(event) => event.stopPropagation()}
      >
        <ScrollArea className="h-48 w-[min(160px,calc(100vw-2rem))] p-1">
          <ul className="flex flex-col gap-0.5">
            {years.map((y) => (
              <li key={y}>
                <button
                  type="button"
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm',
                    isProgrammeDurationYearOptionSelected(y, value) && 'bg-accent',
                  )}
                  onClick={() => {
                    onChange(y)
                    setOpen(false)
                  }}
                >
                  {formatProgrammeDurationYearLabel(y)}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
