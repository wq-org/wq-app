import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type YearSelectPopoverProps = {
  label: string
  value: number
  years: readonly number[]
  onChange: (year: number) => void
  className?: string
  disabled?: boolean
}

export function YearSelectPopover({
  label,
  value,
  years,
  onChange,
  className,
  disabled = false,
}: YearSelectPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn('justify-between font-normal', className)}
          aria-label={label}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <ScrollArea className="h-[min(280px,50vh)] w-[min(140px,calc(100vw-2rem))]">
          <ul className="flex flex-col p-1">
            {years.map((y) => (
              <li key={y}>
                <button
                  type="button"
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm',
                    y === value && 'bg-accent',
                  )}
                  onClick={() => {
                    onChange(y)
                    setOpen(false)
                  }}
                >
                  {y}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
