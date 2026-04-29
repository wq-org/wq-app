import { type ComponentProps, useState } from 'react'
import { addDays, addMonths, format } from 'date-fns'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const PRESETS = [
  { label: 'Today', getDate: () => addDays(new Date(), 0) },
  { label: 'Tomorrow', getDate: () => addDays(new Date(), 1) },
  { label: 'In 3 days', getDate: () => addDays(new Date(), 3) },
  { label: 'In a week', getDate: () => addDays(new Date(), 7) },
  { label: 'In 2 weeks', getDate: () => addDays(new Date(), 14) },
  { label: 'In 3 months', getDate: () => addMonths(new Date(), 3) },
  { label: 'In 6 months', getDate: () => addMonths(new Date(), 6) },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i)

type CalendarWithPresetsProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: ComponentProps<typeof Calendar>['disabled']
  className?: string
  compact?: boolean
}

export function CalendarWithPresets({
  value,
  onChange,
  disabled,
  className,
  compact,
}: CalendarWithPresetsProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    value ?? new Date(currentYear, new Date().getMonth(), 1),
  )
  const [monthOpen, setMonthOpen] = useState(false)
  const [yearOpen, setYearOpen] = useState(false)

  const goToDate = (date: Date) => {
    onChange(date)
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  return (
    <ScrollArea
      className={cn('flex flex-col gap-0', compact && 'h-91', className)}
      onWheel={(event) => event.stopPropagation()}
    >
      {/* Month / year navigation header */}
      <div className="flex items-center gap-1 px-2 pb-1">
        <Popover
          open={monthOpen}
          onOpenChange={setMonthOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-sm font-medium"
            >
              {format(currentMonth, 'MMMM')}
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            className="w-40 p-1"
            align="start"
          >
            <ul className="flex flex-col">
              {MONTHS.map((month, i) => (
                <li key={month}>
                  <button
                    type="button"
                    className={cn(
                      'hover:bg-accent w-full rounded-md px-3 py-1.5 text-left text-sm',
                      currentMonth.getMonth() === i && 'bg-accent',
                    )}
                    onClick={() => {
                      const next = new Date(currentMonth.getFullYear(), i, 1)
                      setCurrentMonth(next)
                      setMonthOpen(false)
                    }}
                  >
                    {month}
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <Popover
          open={yearOpen}
          onOpenChange={setYearOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-sm font-medium"
            >
              {currentMonth.getFullYear()}
              <ChevronDown className="size-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-28 p-1"
            align="start"
          >
            <ScrollArea className="h-48">
              <ul className="flex flex-col">
                {YEARS.map((year) => (
                  <li key={year}>
                    <button
                      type="button"
                      className={cn(
                        'hover:bg-accent w-full rounded-md px-3 py-1.5 text-left text-sm',
                        currentMonth.getFullYear() === year && 'bg-accent',
                      )}
                      onClick={() => {
                        const next = new Date(year, currentMonth.getMonth(), 1)
                        setCurrentMonth(next)
                        setYearOpen(false)
                      }}
                    >
                      {year}
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      <Calendar
        mode="single"
        selected={value}
        onSelect={onChange}
        disabled={disabled}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        fixedWeeks
        className="p-0 [--cell-size:--spacing(9.5)]"
        hideNavigation
      />

      {/* Presets */}
      <div className="flex flex-wrap w-65 gap-1.5 border-t pt-3 mt-1 px-2 pb-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => goToDate(preset.getDate())}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
