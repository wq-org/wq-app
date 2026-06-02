import { CalendarRange, Columns, Grid2x2, Grid3x3, List, Plus } from 'lucide-react'

import { useCalendar } from '../../contexts/useCalendar'

import { Button } from '@/components/ui/button'

import { UserSelect } from './UserSelect'
import { TodayButton } from './TodayButton'
import { DateNavigator } from './DateNavigator'
import { AddEventDialog } from '../dialogs/AddEventDialog'

import type { IEvent, TCalendarView } from '../../types/calendar.types'

type CalendarHeaderProps = {
  events: IEvent[]
}

const VIEW_BUTTONS: {
  view: TCalendarView
  label: string
  icon: typeof List
  corner: 'left' | 'middle' | 'right'
}[] = [
  { view: 'day', label: 'View by day', icon: List, corner: 'left' },
  { view: 'week', label: 'View by week', icon: Columns, corner: 'middle' },
  { view: 'month', label: 'View by month', icon: Grid2x2, corner: 'middle' },
  { view: 'year', label: 'View by year', icon: Grid3x3, corner: 'middle' },
  { view: 'agenda', label: 'View by agenda', icon: CalendarRange, corner: 'right' },
]

export function CalendarHeader({ events }: CalendarHeaderProps) {
  const { view, onViewChange } = useCalendar()

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator
          view={view}
          events={events}
        />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            {VIEW_BUTTONS.map(({ view: buttonView, label, icon: Icon, corner }) => {
              const cornerClass =
                corner === 'left'
                  ? 'rounded-r-none'
                  : corner === 'right'
                    ? '-ml-px rounded-l-none'
                    : '-ml-px rounded-none'

              return (
                <Button
                  key={buttonView}
                  type="button"
                  aria-label={label}
                  size="icon"
                  variant={view === buttonView ? 'default' : 'outline'}
                  className={`${cornerClass} [&_svg]:size-5`}
                  onClick={() => onViewChange(buttonView)}
                >
                  <Icon strokeWidth={1.8} />
                </Button>
              )
            })}
          </div>

          <UserSelect />
        </div>

        <AddEventDialog>
          <Button className="w-full sm:w-auto">
            <Plus />
            Add Event
          </Button>
        </AddEventDialog>
      </div>
    </div>
  )
}
