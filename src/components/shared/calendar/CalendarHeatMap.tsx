import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from 'date-fns'
import { useTranslation } from 'react-i18next'

type CalendarHeatmapSize = 'xs' | 'sm' | 'md' | 'lg'
type CalendarHeatmapColor =
  | 'default'
  | 'destructive'
  | 'info'
  | 'success'
  | 'warning'
  | 'invert'
  | 'secondary'
  | 'darkblue'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'lime'
  | 'orange'
  | 'pink'

interface CalendarHeatmapProps {
  month: number // 1-based (1 = January)
  year: number
  size?: CalendarHeatmapSize
  color?: CalendarHeatmapColor
  showWeekdays?: boolean
}

const sizeMap: Record<CalendarHeatmapSize, string> = {
  xs: 'size-1',
  sm: 'size-2',
  md: 'size-3',
  lg: 'size-4',
}

const weekdayTextSizeMap: Record<CalendarHeatmapSize, string> = {
  xs: 'text-[9px]',
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-[11px]',
}

const gapMap: Record<CalendarHeatmapSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
}

const colorMap: Record<CalendarHeatmapColor, string> = {
  default: 'bg-primary',
  destructive: 'bg-destructive',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  invert: 'bg-invert',
  secondary: 'bg-secondary',
  darkblue: 'bg-blue-500',
  violet: 'bg-[oklch(var(--oklch-violet))]',
  indigo: 'bg-[oklch(var(--oklch-indigo))]',
  blue: 'bg-[oklch(var(--oklch-blue))]',
  cyan: 'bg-[oklch(var(--oklch-cyan))]',
  teal: 'bg-[oklch(var(--oklch-teal))]',
  green: 'bg-[oklch(var(--oklch-green))]',
  lime: 'bg-[oklch(var(--oklch-lime))]',
  orange: 'bg-[oklch(var(--oklch-orange))]',
  pink: 'bg-[oklch(var(--oklch-pink))]',
}

export function CalendarHeatmap({
  month,
  year,
  size = 'xs',
  color = 'default',
  showWeekdays = false,
}: CalendarHeatmapProps) {
  const { t } = useTranslation('common')
  const days = eachDayOfInterval({
    start: startOfMonth(new Date(year, month - 1)),
    end: endOfMonth(new Date(year, month - 1)),
  })

  // pad start: Monday-based (0 = Mon ... 6 = Sun)
  const firstDow = (getDay(days[0]) + 6) % 7 // convert Sun=0 to Mon=0
  const blanks = Array.from({ length: firstDow })

  // chunk into weeks (columns)
  const cells = [...blanks.map(() => null), ...days]
  const weeks: Array<Array<Date | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  const weekdayLabels = t('calendar.weekdays.compact', { returnObjects: true }) as string[]

  return (
    <div className={`inline-flex flex-col ${gapMap[size]}`}>
      {showWeekdays ? (
        <div className={`flex text-muted-foreground ${weekdayTextSizeMap[size]} ${gapMap[size]}`}>
          {weekdayLabels.map((label, index) => (
            <div
              key={`${label}-${index}`}
              className={`${sizeMap[size]} flex items-center justify-center leading-none`}
            >
              {label}
            </div>
          ))}
        </div>
      ) : null}

      <div className={`flex flex-col ${gapMap[size]}`}>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className={`flex ${gapMap[size]}`}
          >
            {week.map((day, di) =>
              day === null ? (
                <div
                  key={`blank-${di}`}
                  className={sizeMap[size]}
                />
              ) : (
                <div
                  key={day.toISOString()}
                  className={`${sizeMap[size]} ${colorMap[color]} rounded-full`}
                  title={day.toDateString()}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
